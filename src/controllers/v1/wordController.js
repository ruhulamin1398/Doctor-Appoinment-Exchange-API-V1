const asyncHandler = require("express-async-handler");
const Word = require("../../models/wordSchema");
const natural = require('natural');
const { JaroWinklerDistance } = natural; 

//@desc Create New word
//@route POST /add-word
//@access pubic
const getWords = asyncHandler(async (req, res) => {
  const allWords = await Word.find();


  res.render('words', { allWords });
});


//@desc Render the add-words view
//@route GET /add-words
//@access public
const renderAddWordsView = asyncHandler(async (req, res) => {
  const allWords = await Word.find();
 
  res.render('addWord', { allWords });
});

 

// @desc Create New word
// @route POST /add-word
// @access public
const addWordForm = asyncHandler(async (req, res) => {
  console.log(req.body); 

  const { category, word } = req.body;

  if (!word) {
    res.status(400).json({ error: "All fields are mandatory!" });
    return;
  }

  let cat;

  try {
    if (category) {
      cat = await Word.findOne({ category: category });

      if (!cat) {
        cat = await Word.create({
          category: category,
          items: [],
        });
      }
    } else {
      cat = await Word.findOne({ category: "default" });
    }

    // Check if each word in 'words' is not already in 'cat.items', then add it
     
      if (!cat.items.includes(word)) {
        cat.items.push(word);
      }
     

    await cat.save(); // Save the updated document

    res.status(201).json(cat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});






//@desc Create New word
//@route POST /add-word
//@access pubic
const addWords = asyncHandler(async (req, res) => {
  

  const { category, words } = req.body;
 
  if (!words) {
    res.status(400).json({ error: "All fields are mandatory!" });
    return;
  }

  let cat;

  if (category) {
    cat = await Word.findOne({ category: category });

    if (!cat) {
      cat = await Word.create({
        category: category,
        items: [],
      });
    }
  } else {
    cat = await Word.findOne({ category: "default" });
  }

  // Check if each word in 'words' is not already in 'cat.items', then add it
  words.forEach(word => {
    if (!cat.items.includes(word)) {
      cat.items.push(word);
    }
  });

  await cat.save(); // Save the updated document

  res.status(201).json(cat);
});



//@desc Create New word
//@route get /ckWords
//@access pubic
const ckWords = asyncHandler(async (req, res) => {
 
   const input = req.query.word;
  const categories = await Word.find();
  const allWords = categories.flatMap(obj => obj.items);
 


  let closestMatch = [];
  let highestScore = 0.8;
  let status = 0;


  allWords.forEach((word) => {
    const similarityScore = JaroWinklerDistance(input.toLowerCase(), word.toLowerCase());

    if (similarityScore > highestScore) {
      closestMatch.push(word);
      if (similarityScore == 1)
        status = 1;

    }
  });







  res.json({
    status,
    "similar": closestMatch
  });
});



module.exports = {
  addWords,
  getWords,
  ckWords,
  renderAddWordsView,
  addWordForm
};
