const Note = require("../models/Note.cjs");

const asyncHandler = require("express-async-handler");

const checkNotes = (notes, res) => {
  if (!notes || notes.length === 0) {
    res.json({ message: "no Notes found !" });

    return false;
  }
  return true;
};

const getNotes = asyncHandler(async (req, res) => {
  const { title, userId } = req.body;
  if (title) {
    const notes = await Note.find({ title }).exec();

    if (!checkNotes(notes, res)) return;
    return res.json(notes);
  }
  if (userId) {
    const notes = await Note.find({ user:userId }).lean().exec();
    if (!checkNotes(notes, res)) return;
    return res.json(notes);
  }

  const notes = await Note.find().lean();
  if (!checkNotes(notes, res)) return;
  return res.json(notes);
  res.json(notes);
});

const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields required !" });
  }
  const noteObject = { user, title, text, completed: true };

  const result = await Note.create(noteObject);

  res.status(201).json({ message: `Note : ${title} created successfully !` });
});

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Id is Required !" });
  }
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "No note found" });
  }
  const result = await note.deleteOne();
  res.json({ message: "Ressource deleted Successfully !" });
});

const updateNote = asyncHandler(async (req, res) => {
  const { id, text, title } = req.body;

  if (!id || !text || !title) {
    return res.status(400).json({ message: "all Fields are Required !" });
  }

  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "the note is not found !" });
  }
  note.text = text;
  note.title = title;
  note.completed = true;

  const updatedNote = await note.save();

  res.json({ message: `Note Updated ${title} Successfully!` });
});
module.exports = {
  getNotes,
  updateNote,
  createNewNote,
  deleteNote,
};
