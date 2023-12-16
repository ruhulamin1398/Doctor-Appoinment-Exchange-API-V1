const express = require("express");
const {
  getWords,
  addWords,
  } = require("../../controllers/v1/wordController");
 
const router = express.Router();

router.post("/add-word", addWords);
router.get("/words", getWords);

module.exports = router;