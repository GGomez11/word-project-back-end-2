import express, { Request, Response, NextFunction } from "express";
import { verifyGoogleIdToken } from "../middleware/authMiddleware";
import User from '../models/User';

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

router.get('/', verifyGoogleIdToken, async (req: Request, res: Response, next: NextFunction) => { 
  // try {
  //   const user = await User.findOne({email: req.email}).exec
  //   res.status(200).json(user.vocabulary)
  // } catch (error) {
  //   res.status(400).send(error);
  // }
  res.json({ words: [
      {
        word: 'Diminutive1',
        id: 1,
        results: [
          {
            definition: 'very small',
            partOfSpeech: 'adjective',
            synonym: ['bantam', 'flyspeck', 'lilliputian', 'midget', 'petite', 'tiny'],
          },
          {
            definition: 'a word that is formed with a suffix (such as -let or -kin) to indicate smallness',
            partOfSpeech: 'noun'
          }
        ],
        pronunciation: `dɪ'mɪnjətɪv`,
      },
      {
        word: 'Nugatory2',
        id: 2,
        results: [
          {
            definition: 'of no real value',
            partOfSpeech: 'adjective',
            synonym: ['worthless'],
          },
        ],
        pronunciation: `'nuɡə,toʊri`,
      },
      {
        word: 'Rancid3',
        id: 3,
        results: [
          {
            definition: 'smelling of fermentation or staleness',
            partOfSpeech: 'adjective',
            synonym: ['sour'],
          },
          {
            definition: '(used of decomposing oils or fats) having a rank smell or taste usually due to a chemical change or decomposition',
            partOfSpeech: 'adjective',
          }
        ],
        pronunciation: `'rænsɪd`,
      },
      {
        word: 'Diminutive4',
        id: 4,
        results: [
          {
            definition: 'very small',
            partOfSpeech: 'adjective',
            synonym: ['bantam', 'flyspeck', 'lilliputian', 'midget', 'petite', 'tiny'],
          },
          {
            definition: 'a word that is formed with a suffix (such as -let or -kin) to indicate smallness',
            partOfSpeech: 'noun'
          }
        ],
        pronunciation: `dɪ'mɪnjətɪv`,
      },
      {
        word: 'Nugatory5',
        id: 5,
        results: [
          {
            definition: 'of no real value',
            partOfSpeech: 'adjective',
            synonym: ['worthless'],
          },
        ],
        pronunciation: `'nuɡə,toʊri`,
      },
      {
        word: 'Rancid6',
        id: 6,
        results: [
          {
            definition: 'smelling of fermentation or staleness',
            partOfSpeech: 'adjective',
            synonym: ['sour'],
          },
          {
            definition: '(used of decomposing oils or fats) having a rank smell or taste usually due to a chemical change or decomposition',
            partOfSpeech: 'adjective',
          }
        ],
        pronunciation: `'rænsɪd`,
      }
    ]})
});

export default router;