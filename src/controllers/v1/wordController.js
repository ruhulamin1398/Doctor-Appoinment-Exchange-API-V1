const asyncHandler = require("express-async-handler"); 
const Word = require("../../models/wordSchema");
// const words = require("../../views/words.ejs")

//@desc Create New word
//@route POST /add-word
//@access pubic
const getWords = asyncHandler(async (req, res) => {
  const allWords = await Word.find();
  let words = [];

  // for (const cat of allWords) {
  //   words = words.concat(cat.items);
  //   console.log(cat.items);
  // }

  res.render('words', { allWords });
});



//@desc Create New word
//@route POST /add-word
//@access pubic
const addWords = asyncHandler(async (req, res) => {
  const { category, words } = req.body;
  if (!category || !words) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  let cat = await Word.findOne({ category: category });
  if (!cat) {
    cat = await Word.create({
      category: category,
      items: [], // Assuming 'items' is an array
    });
  }

  // Assuming 'words' is an array, you can use concat to add new words
  cat.items = cat.items.concat(words);

  await cat.save(); // Save the updated document


  let recat = await Word.findOne({ category: category });

  res.status(201).json(recat);
});


module.exports = {
  addWords,
  getWords
};
