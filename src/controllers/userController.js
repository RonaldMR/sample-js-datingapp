const userController = ({ userApplication }) => {
    const postUser = async (req, res, next) => {
        const {
            email,
            password
        }
        return userApplication.addUser(req.body)
    }

    return Object.freeze({
        postUser
    })
}