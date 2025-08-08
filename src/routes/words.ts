import express, { Request, Response, NextFunction, response } from "express";
import User from '../models/User';
import authMiddleware from "../middleware/authMiddleware";
import { MerriamWebsterEntry } from "../types/merriamWebsterEntry"
// @ts-ignore
import lemmatizer from 'wink-lemmatizer';

const router = express.Router();

/* GET default word listing. */
router.get('/homePage', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    word: 'diligent',
    id: 1,
    results: [
      {
        definition: 'characterized by steady, earnest, and energetic effort : painstaking',
        partOfSpeech: 'adjective',
        synonym: [
          "<strong>busy</strong> <strong>industrious</strong> <strong>diligent</strong> <strong>assiduous</strong> <strong>sedulous</strong> mean actively engaged or occupied. <strong>busy</strong> chiefly stresses activity as opposed to idleness or leisure. ",
          " <strong>industrious</strong> implies characteristic or habitual devotion to work. ",
          " <strong>diligent</strong> suggests earnest application to some specific object or pursuit. ",
          " <strong>assiduous</strong> stresses careful and unremitting application. ",
          " <strong>sedulous</strong> implies painstaking and persevering application. "
        ]
      },
    ],
    pronunciation: {
      written: `'di-lə-jənt`,
      audioURL: 'https://media.merriam-webster.com/audio/prons/en/us/mp3/d/dilige04.mp3'
    }
  });
});

router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => { 
  //@ts-ignore
  try {
    //@ts-ignore
    const user = await User.findOne({uid: req.user.uid}, ).exec()
    if (user) {
      res.status(200).json({words: user.vocabulary})
      return
    }
    else {
       //@ts-ignore
      const newUser = new User({
        //@ts-ignore
        uid: req.user.uid,
        //@ts-ignore
        name: req.user.name,
        //@ts-ignore
        email: req.user.email,
        vocabulary: [],
        //@ts-ignore
        authProvider: [req.user.firebase.sign_in_provider]
      })
      await newUser.save()
    }
    res.status(201).json([])
    return 
  } catch (error) {
    res.status(400).send(error);
    return
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  let word = req.body.word;
  if (!word) {
    res.status(400).json({"message": "No word found to add."}).send();
    return;
  }
  // Make request to rapid api
  let request;
  let response;
  let word_base = '';
  let parsedWord = ''

  try {
    for (const cand of getCandidates(word)){
      request = await getWordDefinition(cand);
      response = await request.json();
      if (response.length !== 0) {
        word_base = cand
        break
      }
      res.status(400).json({"message": "Failed to add word."});
      return
    }
  
    
    try {
      parsedWord = parseDictionaryPayload(response, word_base);
    } catch (error) {
      res.status(400).json({"message": "Failed to add word."})
      return
    }
    
    // Update users vocabulary
    try {
    // @ts-ignore
      await User.updateOne({uid: req.user.uid}, {$push: {vocabulary: parsedWord}}).exec()
    } catch (error) {
      console.log("Update failed", error)
      res.status(400).json({"message": "Failed to add word."})
    }

    try {
      //@ts-ignore
      const user = await User.findOne({uid: req.user.uid}, ).exec()
      if (user) {
        res.status(201).json({words: user.vocabulary});
        return;
      }
    } catch (error) {
      res.status(400).json({"message": "User not found"});
    }
  } catch (error) {
    console.error('Error getting word from dicationary api', error);
  }
});

router.delete('/:word', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  const word = req.params.word;
  if (!word) {
    res.status(400).json({"message": "No word found to add."});
    return;
  }
  // Make request to remove word
  try {
    console.log(word)
    // @ts-ignore
    await User.updateOne({uid: req.user.uid}, { $pull: { vocabulary: {word: word}}}).exec();
    res.status(204).send();

  } catch (error) {
    console.log("Delete failed", error);
    res.status(404).json({"message": "Failed to remove word"});
  }

});
export default router;

function getCandidates(word: string) {
  let candidates = new Set<string>([
    lemmatizer.verb(word),
    lemmatizer.noun(word),
    lemmatizer.adjective(word),
  ]);

  // Super-light extra normalizations
  if (word.endsWith("'s")) candidates.add(word.slice(0, -2));
  if (word.endsWith("’s")) candidates.add(word.slice(0, -2));

  return [...candidates].filter(Boolean);
}

// Get from Dictionary API
function getWordDefinition(word: string) {
   return fetch(`${process.env.DICTIONARY_API_URL}/${word}?key=${process.env.DICTIONARY_API_KEY}`)
}

function parseDictionaryPayload(payload: any[], word: string): any {
  if (!Array.isArray(payload) || payload.length === 0) {
      console.error("Invalid payload structure or empty payload");
      return [];
  }

  // Filter the payload to include only entries related to root word
  const mainEntries = payload.filter(entry =>
    entry.hwi.hw.replace(/\*/g, '') == `${word}`
  ); 
  
  const results = mainEntries.map(entry => {
    let synonym = 'None'

    if (entry.syns) {
      // @ts-ignore
      synonym = entry.syns[0].pt
      // @ts-ignore
      .filter(syn => syn[0] == 'text')
      // @ts-ignore
      .map(syn => syn[1].replace(/{sc}(.*?)\{\/sc}/g, '<strong>$1</strong>'))
    }
    console.log(synonym)
    const definitionEntry = {
      definition: entry.shortdef[0],
      partOfSpeech: entry.fl,
      synonym: synonym
    }
    return definitionEntry
  })
  
  let pronuncation = {
    written: '',
    audioURL: ''
  }

  // Get written pronunciation
  if (checkForWrittenPronunciation(payload[0])) {
    pronuncation.written = getWrittenPronunciation(payload[0])
  } else {
    pronuncation.written = "Not available"
  }

  // Get audio url pronunciation
  if (checkForAudioPronunciation(payload[0])) {
    pronuncation.audioURL = getAudioURLPronunciation(word, payload[0].hwi.prs[0].sound.audio)
    
  } else {
    pronuncation.audioURL = 'Not available'
  }

  const wordEntry = {
    word: word,
    pronunciation: pronuncation,
    results: results
  }
  
  return wordEntry
}
  

function getAudioURLPronunciation(word: string, baseFileName: string) {
  const languageCode = 'en';
  const countryCode = 'us';
  const format = 'mp3';
  const subdirectory = getSubdirectory(word);

  const url = `https://media.merriam-webster.com/audio/prons/${languageCode}/${countryCode}/${format}/${subdirectory}/${baseFileName}.${format}`
    
  return url
}

function getWrittenPronunciation(payload: MerriamWebsterEntry) {
  return payload.hwi!.prs![0].mw;
}

function getSubdirectory(word: string) {
    // Check if audio begins with "bix"
    if (word.startsWith("bix")) {
      return "bix";
    }
    // Check if audio begins with "gg"
    else if (word.startsWith("gg")) {
        return "gg";
    }
    // Check if audio begins with a number or punctuation
    else if (/^[0-9\W]/.test(word[0])) {
        return "number";
    }
    // Otherwise, use the first letter of audio
    else {
        return word[0];
    }
}

function checkForAudioPronunciation(payload: MerriamWebsterEntry) {
  return payload.hwi.prs?.some(prs => prs.sound?.audio !== undefined) ?? false;
}

function checkForWrittenPronunciation(payload: MerriamWebsterEntry) {
  return payload.hwi.prs?.some(prs => prs.mw !== undefined) ?? false;
}