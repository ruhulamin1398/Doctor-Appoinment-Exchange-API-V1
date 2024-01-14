const express = require("express");
const {
  getWords,
  addWords,
  ckWords,
  renderAddWordsView,
  addWordForm,
  } = require("../../controllers/v1/wordController");
 
const router = express.Router();


router.get("/words", getWords);
router.get('/add-words', renderAddWordsView);
router.post("/add-word-form", addWordForm);
router.post("/add-words", addWords);
router.get("/ck-word", ckWords);



module.exports = router;