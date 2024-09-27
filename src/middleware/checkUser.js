const isLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        (req.path === '/login') ? res.redirect('/') : next() 
    } else {
        (req.path === '/login') ? next() : res.redirect('/login')
    }
}

module.exports = {
    isLogin
}