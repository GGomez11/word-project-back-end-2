import express, { Request, Response, NextFunction, response } from "express";
import User from '../models/User';
import authMiddleware from "../middleware/authMiddleware";
import { MerriamWebsterEntry } from "../types/merriamWebsterEntry"

const router = express.Router();

/* GET default word listing. */
router.get('/homePage', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    word: 'Diminutive',
    id: 1,
    results: [
      {
        definition: 'very small',
        partOfSpeech: 'adjective',
        synonym: 'bantam, flyspeck, lilliputian, midget, petite, tiny',
      },
      {
        definition: 'a word that is formed with a suffix (such as -let or -kin) to indicate smallness',
        partOfSpeech: 'noun',
      },
    ],
    pronunciation: `dɪ'mɪnjətɪv`,
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
  const word = req.body.word;
  if (!word) {
    res.status(400).json({"message": "No word found to add."}).send();
    return;
  }
  // Make request to rapid api
  try {
    // Uncomment for real request
   const request = await getWord(word);
   const response = await request.json();
    
  const parsedWord = parseDictionaryPayload(response, word);
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

// Get from Dictionary API
async function getWord(word: string) {
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
    let synynom = ''

    if (entry.syns) {
      synynom = entry.syns
    }

    const definitionEntry = {
      definition: entry.shortdef[0],
      partOfSpeech: entry.fl,
      synynom: synynom
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