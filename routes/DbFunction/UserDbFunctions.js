const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { get } = require('../../config/mongodb')

// setting functions to get the collections easily  
const Book = () => get().collection('books')             // collection Books
const Periodicals = () => get().collection('periodicals') // collection periodicals 
const User = () => get().collection('users')             // collection users 

module.exports = {
    getUser: async query => {
        try {
            const user = await User().findOne(query)
            return { user }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    signUp: async (data) => {
        data.borrowed = []
        try {
            data.password = await bcrypt.hash(data.password, 12)
            const newUser = (await User().insertOne(data)).ops[0]
            return { newUser }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    login: async (email, password) => {
        try {
            const user = await User().findOne({ email })
            if (!user) return { err: 'User Not found', code: 404 }
            const checkPassword = await bcrypt.compare(password, user.password)
            if (!checkPassword) return { err: 'Password wrong', code: 403 }
            return { user }
        } catch (e) {
            console.error(e);
            return { err: 'Internal server error', code: 500 }
        }
    },
    borrowBook: async (bookId, id) => {
        try {
            const { value } = await Book().findOneAndUpdate(
                { _id: ObjectId(bookId), stocks: { $gt: 0 } },
                { $inc: { stocks: -1, borrowed: 1 } }, { returnOriginal: false })
            if (!value) return { err: 'Book is not available', code: 404 }
            const userData = await User().findOneAndUpdate(
                { _id: ObjectId(id) }, {
                $push: {
                    borrowed: {
                        id: `${bookId}`,
                        date: new Date(),
                        type: 'book'
                    }
                }
            }, { returnOriginal: false }
            )
            return { borrowed: userData.value.borrowed }
        } catch (e) {
            console.error(e)
            return { err: 'Internal server error', code: 500 }
        }
    },
    borrowPeriodical: async (perId, volume, issue, id) => {
        try {
            const { value } = await Periodicals().findOneAndUpdate(
                {
                    _id: ObjectId(perId)
                    , 'issues.volume': volume, 'issues.issue': issue, 'issues.stocks': { $gt: 0 }
                },
                { $inc: { 'issues.$.stocks': -1, 'issues.$.borrowed': 1 } },
                { returnOriginal: false })
            if (!value) return { err: 'Periodical is not available', code: 404 }
            const userData = await User().findOneAndUpdate(
                { _id: ObjectId(id) },
                {
                    $push: {
                        borrowed: {
                            id: `${perId}`,
                            volume: volume,
                            issue: issue,
                            date: new Date()
                        }
                    }
                }, { returnOriginal: false }
            )
            return { borrowed: userData.value.borrowed }
        } catch (e) {
            console.error(e);
            return { err: 'internal server error', code: 500 }
        }
    }
}

// setTimeout(async () => {
//     let data = await Periodicals().findOne({
//         _id: ObjectId('60df205114a65826668f381b')
//         , 'issues.volume': 1, 'issues.issue': 1, 'issues.stocks': { $gt: 0 }
//     })
//     console.log(data);
// }, 1000);
// clearTimeout()