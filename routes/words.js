var express = require('express');
var router = express.Router();

/* GET default word listing. */
router.get('/default', function(req, res, next) {
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
            partOfSpeech: 'noun'
        }
    ],
    pronunciation: `dɪ'mɪnjətɪv`,
})
});

module.exports = router;
