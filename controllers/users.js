var {Email,Head} = require('../untils/config.js');
var UserModel = require('../models/users.js');
var fs = require('fs');
var url = require('url');
var {setCrypto , creatVerify} = require('../untils/base.js');

var login = async (req,res,next) => {
	var {username,password,verifyImg} = req.body;
	if (verifyImg !== req.session.verifyImg) {
		res.send({
			msg: '验证码输入不正确',
			status: -3
		});
		return;
	}
	var result = await UserModel.findLogin({
		username,
		password: setCrypto(password)
	});

	if (result) {

		req.session.username = username;
		req.session.isAdmin = result.isAdmin;
		req.session.userHead = result.userHead;

		if(result.isFreeze){
			res.send({
				msg: '账户已冻结',
				status: -2
			});
		}else{
			res.send({
				msg: '登录成功',
				status: 0
			});
		}
		
	}else{
		res.send({
			msg: '登录失败',
			status: -1
		});
	}
};

var register = async (req,res,next) => {
	var {username,password,email,verify} = req.body;

	if(email !== req.session.email || verify !== req.session.verify){
		res.send({
			msg: '验证码错误',
			status: -1
		});
		return;
	}

	if((Email.time - req.session.time)/1000 > 60){
		res.send({
			msg: '验证码已过期',
			status: -3
		});
		return;
	}

	var result = await UserModel.save({
		username,
		password : setCrypto(password),
		email
	});

	if (result) {
		res.send({
			msg: '注册成功',
			status: 0
		});
	}else{
		res.send({
			msg: '注册失败',
			status: -2
		});
	}
};

var verify = async (req,res,next) => {
	var email = req.query.email;
	var verify = Email.verify;

	req.session.verify = verify;
	req.session.email = email;
	req.session.time = Email.time;

	var mailOption = {
		from: '1049644962@qq.com', // sender address
	    to: email, // list of receivers
	    subject: '喵喵电影注册验证码', // Subject line
	    text: '验证码：' + verify // plain text body
	}
	Email.transporter.sendMail(mailOption,(err) => {

		if(err){
			res.send({
				msg: '邮件发送失败',
				status: -1
			})
		}else{
			res.send({
				msg: '邮件发送成功',
				status: 0
			})
		}
	});

};

var logout = async (req,res,next) => {
	req.session.username = '';
	res.send({
		msg: '退出成功',
		status: 0
	});

};

var getUser = async (req,res,next) => {
	if(req.session.username){
		res.send({
			msg: '获取用户信息成功',
			status: 0,
			data: {
				username: req.session.username,
				isAdmin: req.session.isAdmin,
				userHead: req.session.userHead
			}
		});
	}else{
		res.send({
			msg: '获取用户信息失败',
			status: -1
		})
	}
};

var findPassword = async (req,res,next) => {
	
	var {email , password , verify} = req.body;

	if (email === req.session.email && verify === req.session.verify) {

		var result = await UserModel.updatePassword(email,setCrypto(password));

		if (result) {
			res.send({
				msg: '修改密码成功',
				status: 0
			});
		}else{
			res.send({
				msg: '修改密码失败',
				status: -1
			});
		}
	}else{
		res.send({
				msg: '验证码错误',
				status: -1
			});
	}
};

var verifyImg = async (req,res,next) => {
	var result = await creatVerify(req,res);
	if (result) {
		res.send(result);
	}
}

var uploadUserHead = async (req,res,next) => {
	console.log(req.file);
	await fs.rename('public/uploads/'+ req.file.filename , 'public/uploads/' + req.session.username + '.jpg',
		(err) => {
  			if (err) throw err;
  			console.log('重命名完成');
  		}
  	);
	var result = await UserModel.updateUserHead(req.session.username,url.resolve(Head.baseUrl,req.session.username+'.jpg'));
	if(result){
		res.send({
			msg: '头像修改成功',
			status: 0,
			data: {
				userHead : url.resolve(Head.baseUrl , req.session.username + '.jpg')
			}
		});
	}else{
		res.send({
			msg: '头像修改失败',
			status: -1
		});
	}
}

module.exports = {
	login,
	register,
	verify,
	logout,
	getUser,
	findPassword,
	verifyImg,
	uploadUserHead
}