
const getLoginPage = (req, res) => {
    return res.render("login.ejs", { error: req.flash('message') })
}

module.exports = {
    getLoginPage
}
