import passport from 'passport'
import { Strategy } from 'passport-local'
import { mockUsers } from '../utils/constants.mjs'


passport.serializeUser((user, done) => {
    console.log(`Inside Serialise User`)
    console.log(user)
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    console.log(`Inside Deserialiser`)
    console.log(`Deserializing User ID: ${id}`)
    try {
        const findUser = mockUsers.find((user) => user.id === id)
        if (!findUser) throw new Error("User Not Found")
        done(null, findUser)
    } catch (err) {
        done(err, null)
    }
})

export default passport.use(
    new Strategy((username, passport, done) => {
        try {
            const findUser = mockUsers.find((user) => user.username == username)
            if (!findUser) throw new Error("User not found")
            if (findUser.password !== passport) throw new Error("Invalid credentials")
            done(null, findUser)
        } catch (err) {
            done(null, null)
    }
    })
)