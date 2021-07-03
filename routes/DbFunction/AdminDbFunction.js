const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { get } = require('../../config/mongodb')

// setting functions to get the collections easily  
const Book = () => get().collection('books')             // collection Books
const Admin = () => get().collection('admin')             // collection Admin 
const Periodicals = () => get().collection('periodicals') // collection periodicals 
const User = () => get().collection('users')             // collection users 

module.exports = {
    // CRUD functions for Books
    addNewBook: async function (bookData) {
        bookData.borrowed = 0
        try {
            const newBook = await Book().insertOne(bookData)
            return { newBook: newBook.ops[0] }
        } catch (e) {
            console.error(e);
            return { err: e }
        }
    },
    deleteBook: async Id => {
        try {
            const { value } = await Book().findOneAndDelete({ _id: ObjectId(Id) }, { returnOriginal: false })
            return { deletedBook: value }
        } catch (e) {
            console.error(e);
            return { err: e }
        }
    },
    getOneBook: async Id => {
        try {
            const book = await Book().findOne({ _id: ObjectId(Id) })
            return { book }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    updateBook: async (Id, data) => {
        try {
            const { value } = await Book().findOneAndUpdate(
                { _id: ObjectId(Id) }, { $set: data }, { returnOriginal: false }
            )
            return { updatedBook: value }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    getAllBooks: async () => {
        try {
            const allBooks = await Book().find({}).toArray()
            return { allBooks }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    // CRUD functions for Periodicals 
    addPeriodical: async data => {
        data.issues = []
        try {
            const newPeriodical = (await Periodicals().insertOne(data)).ops[0]
            return { newPeriodical }
        } catch (e) {
            console.error(e);
            return { err: tru }
        }
    },
    getPeriodical: async Id => {
        try {
            const periodical = await Periodicals().findOne({ _id: ObjectId(Id) })
            return { periodical }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    editPeriodical: async (Id, data) => {
        try {
            const editedPeriodical = await Periodicals().findOneAndUpdate({ _id: ObjectId(Id) }, { $set: data }, { returnOriginal: false })
            return { editedPeriodical }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    deletePeriodical: async Id => {
        try {
            const { value } = await Periodicals().findOneAndDelete({ _id: ObjectId(Id) })
            return { deletedPeriodical: value }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    getAllPeriodicals: async () => {
        try {
            const allPeriodicals = await Periodicals().find().toArray()
            return { allPeriodicals }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    addIssue: async (Id, data) => {
        data.borrowed = 0
        try {
            const { value } = await Periodicals().findOneAndUpdate(
                { _id: ObjectId(Id) },
                { $push: { issues: data } },
                { returnOriginal: false })
            return { newIssue: value.issues.pop() }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    getAnIssue: async (Id, volume, issue) => {
        try {
            const reqIssue = await Periodicals().findOne(
                { _id: ObjectId(Id), 'issues.volume': volume, 'issues.issue': issue })
            return { reqIssue }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    deleteAnIssue: async (Id, volume, issue) => {
        try {
            const { value } = await Periodicals().findOneAndUpdate(
                { _id: ObjectId(Id), 'issues.volume': volume, 'issues.issue': issue },
                { $pull: { issues: { volume, issue } } }, { returnOriginal: false })
            return { deletedIssue: value }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    getFullVolume: async (Id, volume) => {
        try {
            let data = await Periodicals().findOne({ _id: ObjectId(Id) })
            if (data) data = data.issues.filter(iss => iss.volume === volume)
            data = data || []
            return { data }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    }
    ,
    // CRUD for users 
    addUser: async userData => {
        userData.approved = true
        userData.borrowed = []
        try {
            userData.password = await bcrypt.hash(userData.password, 12)
            const newUser = (await User().insertOne(userData)).ops[0]
            return { newUser }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    deleteUser: async Id => {
        try {
            const { value } = await User().findOneAndDelete({ _id: ObjectId(Id) })
            return { deletedUser: value }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    editUser: async (Id, data) => {

        try {
            if (data.password) data.password = await bcrypt.hash(data.password, 12)
            const { value } = await User().findOneAndUpdate({ _id: ObjectId(Id) }, { $set: data }, { returnOriginal: false })
            return { editedUser: value }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    getUser: async ({ Id, email }) => {
        let query = Id ? { _id: ObjectId(Id) } : { email: email }
        try {
            const user = await User().findOne(query)
            return { user }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    },
    getAllUser: async () => {
        try {
            const allUser = await User().find().toArray()
            return { allUser }
        } catch (e) {
            console.error(e);
            return { err: true }
        }
    }
}

// 60ddc52844cb6f289954ea2e 60ddef5180c91b5626cf5b42 60ddef8d6cf204568b62de73