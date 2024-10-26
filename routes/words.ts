import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

/* GET default word listing. */
router.get('/default', (req: Request, res: Response, next: NextFunction) => {
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

export default router;