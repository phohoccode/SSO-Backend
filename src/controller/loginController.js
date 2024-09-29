
const getLoginPage = (req, res) => {
    const { serviceURL } = req.query
    return res.render("login.ejs", {
        redirectURL: serviceURL
    })
}

module.exports = {
    getLoginPage
}
