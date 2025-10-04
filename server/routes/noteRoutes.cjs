const express=require("express")
const router=express.Router();
const noteControllers=require("../controllers/noteController.cjs");



router.route("/")
.get(noteControllers.getNotes)
.post(noteControllers.createNewNote)
.patch(noteControllers.updateNote)
.delete(noteControllers.deleteNote)


module.exports=router;