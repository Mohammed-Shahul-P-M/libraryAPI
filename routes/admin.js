const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { addNewBook, updateBook, deleteBook, getOneBook, getAllBooks,
  addPeriodical, getPeriodical, editPeriodical, deletePeriodical,
  addUser, deleteUser, editUser, getUser, getAllUser, getAllPeriodicals, addIssue, getAnIssue, deleteAnIssue, getFullVolume } = require('./DbFunction/AdminDbFunction')

// add new book to database 
router.post('/addbook', async (req, res) => {

  let { title, author, stocks, description, shelfNo, bookId } = req.body

  try {

    // if value is falsy assign default value 
    [author, description, stocks] = [author || 'Not available', description || 'Not available', parseInt(stocks)]

    //checking required arguments missing and handle 
    if (!title || !stocks || !shelfNo || !bookId || !req.files?.image) {
      let message = ` Argument missing `
      return res.status(400).send({ error: { message } })
    }

    const { newBook, err } = await addNewBook({ title, author, stocks, description, shelfNo, bookId })

    if (!err) res.status(200).json(newBook)
    else res.status(500).json({ error: { message: 'Internal server Error' } })

  } catch (e) {
    console.error(e);
    res.status(500).send({ error: { message: 'Internal server Error' } })
  }
});
//delete a book 
router.get('/delete-book/:Id', async (req, res) => {
  const { Id } = req.params
  if (!ObjectId.isValid(Id)) return res.status(500).json({ error: { message: 'Id must be valid' } })
  try {
    const { deletedBook, err } = await deleteBook(Id)
    if (!err) res.status(200).json(deletedBook)
    else res.status(500).send({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: { message: 'Internal server Error' } })
  }
})
// get one book 
router.get('/getbook/:Id', async (req, res) => {
  const { Id } = req.params
  if (!ObjectId.isValid(Id)) return res.status(500).json({ error: { message: 'Id must be valid' } })
  try {
    const { book, err } = await getOneBook(Id)
    if (!err) res.status(200).json({ book })
    else res.status(500).send({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
//get all book 
router.get('/getbooks/', async (req, res) => {
  try {
    const { allBooks, err } = await getAllBooks()
    if (!err) res.status(200).json({ allBooks })
    else res.status(500).send({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
// update a book 
router.post('/updatebook', async (req, res) => {
  let keys = ['title', 'author', 'stocks', 'description', 'shelfNo', 'bookId']
  let { Id } = req.body
  if (!ObjectId.isValid(Id)) return res.status(500).json({ error: { message: 'Id must be valid' } })
  req.body.stocks = parseInt(req.body.stocks)
  let bookData = {}
  keys.forEach(key => {
    if (req.body[key]) bookData = { ...bookData, [key]: req.body[key] }
  })

  try {
    const { updatedBook, err } = await updateBook(Id, bookData)
    !err ? res.status(200).json({ updatedBook }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
// user routes 
router.post('/createuser', async (req, res) => {
  let { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json('Argument missing')
  try {
    const findUser = await getUser({ email })
    if (findUser.user) return res.status(409).json('User already exist please change email Id')
    else if (findUser.err) return res.status(500).json({ error: { message: 'Internal server Error' } })
    const { newUser, err } = await addUser({ name, email, password })
    !err ? res.status(200).json({ newUser }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
router.get('/deleteUser/:Id', async (req, res) => {
  const { Id } = req.params
  if (!ObjectId.isValid(Id)) return res.status(500).json({ error: { message: 'Id must be valid' } })
  try {
    const { deletedUser, err } = await deleteUser(Id)
    !err ? res.status(200).json({ deletedUser }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
router.get('/getuser/:Id', async (req, res) => {
  const { Id } = req.params
  if (!ObjectId.isValid(Id)) return res.status(500).json({ error: { message: 'Id must be valid' } })
  try {
    const { user, err } = await getUser({ Id })
    !err ? res.status(200).json({ user }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
router.get('/alluser', async (req, res) => {
  try {
    const { allUser, err } = await getAllUser()
    !err ? res.status(200).json({ allUser }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
router.post('/edituser', async (req, res) => {
  let { Id, email } = req.body
  if (!ObjectId.isValid(Id)) return res.status(500).json({ error: { message: 'Id must be valid' } })
  try {

    if (email) {
      const { user, err } = await getUser({ email })
      if (user && user._id.toString() !== Id) return res.status(409).json({ error: { message: 'New email id already exist' } })
      else if (err) return res.status(500).json({ error: { message: 'Internal server Error' } })
    }

    let userData = {}
    const keys = ['password', 'email', 'name']
    keys.forEach(key => {
      if (req.body[key]) userData = { ...userData, [key]: req.body[key] }
    })

    const { editedUser, err } = await editUser(Id, userData)
    !err ? res.status(200).json({ editedUser }) :
      res.status(500).json({ error: { message: 'Internal server error' } })

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})

// periodicals route 
router.post('/addperiodicals', async (req, res) => {

  let { name, description } = req.body
  if (!name || !description) return res.status(400).json({ error: { message: 'Arguments missing' } })

  try {
    const { newPeriodical, err } = await addPeriodical({ name, description })
    !err ? res.status(200).json({ newPeriodical }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }

})

router.get('/deleteperiodical/:Id', async (req, res) => {

  const { Id } = req.params
  if (!ObjectId.isValid(Id)) return res.status(400).json({ error: { message: 'Invalid Id' } })

  try {
    const { deletedPeriodical, err } = await deletePeriodical(Id)
    !err ? res.status(200).json({ deletedPeriodical }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})

router.get('/getperiodical/:Id', async (req, res) => {

  const { Id } = req.params
  if (!ObjectId.isValid(Id)) return res.status(400).json({ error: { message: 'Invalid Id' } })

  try {
    const { periodical, err } = await getPeriodical(Id)
    !err ? res.status(200).json({ periodical }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})

router.get('/allperiodical/', async (req, res) => {

  try {
    const { allPeriodicals, err } = await getAllPeriodicals()
    !err ? res.status(200).json({ allPeriodicals }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})
router.post('/addissue', async (req, res) => {

  let { Id, volume, issue, stocks, } = req.body
  if (!ObjectId.isValid(Id)) return res.status(400).json({ error: { message: 'Invalid Id' } })

  volume = parseInt(volume)
  issue = parseInt(issue)
  stocks = parseInt(stocks)

  if (!Id || !volume || !issue || !stocks) return res.status(400).json({ error: { message: 'Arguments missing' } })
  try {
    //checking if the issue is already exist
    const reqIssue = await getAnIssue(Id, volume, issue)
    if (reqIssue.err) return res.status(500).json({ error: { message: 'Internal server Error' } })
    else if (reqIssue.reqIssue) return res.status(409).json({ error: { message: 'Issue already exist' } })

    // adding new issue to the periodical
    const { newIssue, err } = await addIssue(Id, { volume, issue, stocks })
    !err ? res.status(200).json({ newIssue }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})

router.get('/deleteissue/:Id:/volume/:issue', async (req, res) => {

  let { Id, volume, issue } = req.params
  if (!ObjectId.isValid(Id)) return res.status(400).json({ error: { message: 'Invalid Id' } })
  volume = parseInt(volume)
  issue = parseInt(issue)

  if (!volume || !issue) return res.status(400).json({ error: { message: 'Arguments missing' } })

  try {
    const { deletedIssue, err } = await deleteAnIssue(Id, volume, issue)
    !err ? res.status(200).json({ deletedIssue: 'success' }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})

router.get('/getfullvolume/:id/:volume', async (req, res) => {

  let { Id, volume } = req.params
  if (!ObjectId.isValid(Id)) return res.status(400).json({ error: { message: 'Invalid Id' } })
  volume = parseInt(volume)
  if (!Id || !volume) return res.status(400).json({ error: { message: 'Arguments missing' } })

  try {
    const { data, err } = await getFullVolume(Id, volume)
    !err ? res.status(200).json({ volumes: data }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})


module.exports = router;

