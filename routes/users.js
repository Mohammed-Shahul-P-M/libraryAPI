var express = require('express');
var router = express.Router();
const { getUser, signUp, login, borrowBook, borrowPeriodical } = require('./DbFunction/UserDbFunctions')
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// middleware for verify user 
function verifyUser(req, res, next) {

  const token = req.header('auth-token')
  if (!token) res.status(402).json({ loginErr: true })

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET)
    req.user = verified
    next()
  } catch (e) {
    console.log(e.message);
    res.status(401).json({ error: { message: e.message } })
  }
}

router.post('/signup', async (req, res) => {
  let { name, email, password } = req.body
  console.log(req.body);
  if (!name || !password || !email) return res.status(400).json({ error: { message: 'Argument missing' } })

  try {
    const user = await getUser({ email })
    if (user.err) return res.status(500).json({ error: { message: 'Internal server error' } })
    else if (user.user) return res.status(409).json({ error: { message: 'Email already exist' } })
    const { newUser, err } = await signUp({ name, password, email })
    !err ? res.status(200).json({ newUser }) :
      res.status(500).json({ error: { message: 'Internal server Error' } })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }

})
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: { message: 'Argument missing' } })

  try {
    const { user, err, code } = await login(email, password)
    if (err) res.status(code).json({ error: { message: err } })
    else {
      const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET)
      res.header('auth-token', token)
      res.status(200).json({ user, token })
    }


  } catch (e) {
    console.error(e)
    res.status(500).json({ error: { message: 'Internal server Error' } })
  }
})
router.get('/borrowbook/:bookId', verifyUser, async (req, res) => {
  const { bookId } = req.params
  const { id } = req.user
  if (!ObjectId.isValid(bookId)) return res.status(400).json({ error: { message: 'Invalid book Id' } })
  try {
    const { user, err } = await getUser({ _id: ObjectId(id) })
    if (err) return res.status(500).json({ error: { message: 'Internal server error' } })
    else {
      const { borrowed } = user
      if (borrowed.length > 1 || borrowed.find(book => {
        if (book.id === bookId && book.type === 'book') return book
      })) {
        res.status(403).json({ error: { message: borrowed.length > 1 ? 'max borrow limit 2' : 'book already borrowed' } })
      } else {
        const { borrowed, err, code } = await borrowBook(bookId, id)
        !err ? res.status(200).json({ borrowed }) :
          res.status(code).json({ error: { message: err } })
      }
    }

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})

router.get('/borrowperiodical/:Id/:volume/:issue', verifyUser, async (req, res) => {
  let { Id, volume, issue } = req.params
  const { id } = req.user
  if (!ObjectId.isValid(Id)) return res.status(400).json({ error: { message: 'Invalid book Id' } })
  volume = parseInt(volume)
  issue = parseInt(issue)
  if (!volume || !issue) return res.status(400).json({ error: { message: 'Argument missing' } })
  try {

    const { user, err } = await getUser({ _id: ObjectId(id) })
    if (err) return res.status(500).json({ error: { message: 'Internal server error' } })
    else {
      const { borrowed } = user
      if (borrowed.length > 1 || borrowed.find(book => {
        if (book.id === Id && book.volume === volume && book.issue === issue) return book
      })) {
        res.status(403).json({ error: { message: borrowed.length > 1 ? 'max borrow limit 2' : 'periodical already borrowed' } })
      } else {
        const { borrowed, err, code } = await borrowPeriodical(Id, volume, issue, id)
        !err ? res.status(200).json({ borrowed }) :
          res.status(code).json({ error: { message: err } })
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Internal server error' } })
  }
})

module.exports = router;
