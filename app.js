var express 			= require('express'),
	app 				= express(),
	bodyParser 			= require('body-parser'),
	mongoose 			= require('mongoose'),
	methodOverride 		= require('method-override'),
	expressSanitizer 	= require('express-sanitizer');

// APP CONFIG
// 1) Mongoose: Connect mongodb (run ./mongod)
mongoose.connect('mongodb://localhost/restful_blog_app');
// make ejs file shorcuts
app.set('view engine', 'ejs');
// Serve images, CSS files, and JavaScript files in a directory named public
app.use(express.static('public'));
// Use other packages
app.use(bodyParser.urlencoded({extended: true}));
// Sanitizer must be below bodyParser
app.use(expressSanitizer());
app.use(methodOverride('_method'));

// MONGOOSE/MODEL CONFIG
// 2) Mongoose: create schema and model
// Title, Image, Body, Created
var blogSchema = new mongoose.Schema({
	title: String,
	image: String, //{type: String, default: 'placeholderimage.jpg'}
	body: String,
	created: {type: Date, default: Date.now}
});

// 3) Mongoose: compile into model
var Blog = mongoose.model('blog', blogSchema);

// Create test data blog post
// Blog.create({
// 	title: 'Test Blog',
// 	image: 'http://static.ddmcdn.com/en-us/apl/breedselector/images/breed-selector/dogs/breeds/canaan-dog_01_lg.jpg',
// 	body: 'Hello, this is a blog post.'
// });

// RESTFUL ROUTES
app.get('/', function(req, res) {
	res.redirect('/blogs');
});

// INDEX ROUTE
app.get('/blogs', function (req, res) {
	// Retreive the blogs
	// Passing the data from our database to the parameter 'blogs'
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log('error');
		} else {
			// render WITH DATA
			res.render('index', {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render('new');
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
	// Create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog /* data */, function(err, newBlog) {
		if (err) {
			res.render('new');
		} else {
			res.redirect('/blogs');
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('show', {blog: foundBlog});
		}
	})
});

// EDIT ROUTE
app.get('/blogs/:id/edit', function(req, res) {
	Blog.findById(req.params.id, req.body.blog, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('edit', {blog: foundBlog});
		}
	});
});

// UPDATE ROUTE
app.put('/blogs/:id', function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// Take ID from URL, find existing post and update with new data
	// Blog.findByIdAndUpdate(id, newData, callback)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});

// DESTROY ROUTE
app.delete('/blogs/:id', function(req, res) {
	// destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs');
		}
	});
});

app.listen(3000, function() {
	console.log('server started');
});