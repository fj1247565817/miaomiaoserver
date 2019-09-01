var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var Mongoose = {
	url: 'mongodb://localhost:27017/miaomiao',
	connect() {
		mongoose.connect(this.url, { useNewUrlParser: true },(err) => {
			if(err){
				console.log('数据库连接失败')
			}
			console.log('数据库连接成功')
		})
	}
};

var Email = {
	config: {
		host: "smtp.qq.com",
	    port: 587,
	    auth: {
	      user: '1049644962@qq.com', // generated ethereal user
	      pass: 'pkzwsmtroubebfjd' // generated ethereal password
	    }
	},
	get transporter() {
		return nodemailer.createTransport(this.config);
	},
	//获取验证码
	get verify() {
		return Math.random().toString().substring(2,6);
	},
	// 获取当前时间
	get time() {
		return Date.now();
	}
}

var Head = {
	baseUrl: 'http://localhost:3000/uploads/default.jpg'
}

module.exports = {
	Mongoose,
	Email,
	Head
}