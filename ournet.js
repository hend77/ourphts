
//
var express = require('express');
var app = express();
//экспортируем app для других модулей
module.exports.app = app;

//Для обработки неперехваченных исключений c помощью домена обработки исключений подключаем свой модуль
require('./exptdomain');

//подключаем шаблонизатор handlebars
var handlebars = require('express-handlebars')
                 .create({defaultLayout:'main', 
                          helpers: {
                                    section: function(name, options){ //добавляеются секции для шаблонизатора
                                                 if(!this._sections) this._sections = {}; 
                                                 this._sections[name] = options.fn(this);
                                                 return null; 
                                                }
                          }});    //

//                                                 
app.engine('handlebars',handlebars.engine);
app.set('view engine', 'handlebars');

//Прикрутили парсер для обработки POST запросов для форм 
var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));

//Для загрузки файлов на сервер прикрутили jquery-file-upload
//
//
//
//для работы с cookie прикрутили
var credentials = require('./credentials.js'); //файл с кодовой строкой
var cookieParser = require('cookie-parser');
app.use(cookieParser(credentials.cookieSecret));

//для сеансов cookie прикрутили (при сеансах в куки сохраняется только id сеанса остальное в памяти или в базе(настройки))
expSession = require('express-session');
app.use(expSession({
    resave:false, //Заставляет сеанс заново сохраняться в хранилище, даже если запрос не менял-ся
    saveUninitialized:true,//Установка этого параметра в true приводит к сохранению новых (неинициали-зированных) сеансов в хранилище, даже если они не менялись
    secret:credentials.cookieSecret,//Ключ (или ключи), используемый для подписания cookie-файла идентификато-ра сеанса(рандомная строка)
    //key:'wconnect.sid', //Имя cookie-файла, в котором будет храниться уникальный идентификатор се-анса
    
}));

//сохраняем в локальном окружении данные сессии(пользователь)
app.use(function(req, res, next){ //

 //Сохраним для клиента в окружение userdata
 if((!res.locals.userdata) && (req.session.userdata)){
      res.locals.userdata = req.session.userdata;
   } 
next();
});

//
//Для обработки запросов с файлами от форм(без formidable передача файлов не работает!)
var formidable = require('express-formidable');
app.use('/upload',formidable({
  encoding: 'utf-8',
  uploadDir: __dirname + '/public/uploads',
  multiples: true, // req.files to be arrays of files 
}));

//Для отправки почты прикрутили nodeMailer
var nodeMailer = require('nodemailer');
//Соединиться через сервис
//var mailTransport = nodeMailer.createTransport('SMTP',{
//  service:'Yandex', 
//  auth:{
//        user: credentials.yandex.user,
//        pass: credentials.yandex.password,
//        proxy:'//192.168.26.3:3128' //??
//  }
//});
//Соединиться непосредственно с сервером
var smtpConfig ={ 
host: 'smtp.yandex.com',
secure: true, // используйте SSL //secureConnection
port: 465,
auth: {
  user: credentials.yandex.user,
  pass: credentials.yandex.password,  
},
//proxy:'http://uan:uan@192.168.26.3:3128/'
//proxy:'http://192.168.26.3:3128/'//, //??
};
var mailTransport = nodeMailer.createTransport(smtpConfig);//создали обьект для отправки сообщений

//в зависимости от режима выполнения прикручиваем логгирование на сервере 
switch(app.get('env')){
    case 'development':     
      //сжатое журналирование для разработки
      app.use(require('morgan')('dev')); //прикрутили morgan для журналирования разработки
      break;
    case 'production':  
    // модуль 'express-logger' поддерживает ежедневное
    // чередование файлов журналов
      app.use(require('express-logger')({path:__dirname + '/log/requests.log'}));      
      break;
};
//
// выводим работу исполнителей кластера на экран
  app.use((req,res,next)=>{
    var cluster = require('cluster');
    if(cluster.isWorker){
      console.log('cluster: process %d receive query', process.pid);
   }
    next();
  });  

//----------------------
//ставим порт
app.set('port', process.env.PORT || 3000);

//статический контент
app.use(express.static(__dirname + '/public'));

//Маршрутизация
//Авторизация показываем форму
app.get('/',function(req,res){
   res.render("autorize");
});
//Получили пост от формы авторизации
app.post('/process',(req,res)=>{
      console.log('try autorize: ' + req.query.login);
    //сохраним данные о пользователе в сесии перед ответом   
       req.session.userdata   =  {login:req.body.login,
                                  passw:req.body.password  } ; 
  res.redirect(303,'/home'); //делаем редирект и передаем имя пользователя как параметр
});
app.get('/home',(req,res)=>{
  res.render('home');
});

//Отправка почты
app.get('/mailform',(req,res)=>{
  res.render('mailform');
});

//post от фомы mailform
app.post('/sendmail',(req,res)=>{
    mailTransport.sendMail({
      from:'expressJS',
      to: req.body.email,
      subject:'expressinfo',
      text:req.body.text 
    },
    (err)=>{
      if(err){console.log('error mail sending ')};
    });//sendMail
});//post

//plagin lite jquery upload
app.get('/fileuploader',(req,res)=>{
    res.render('fileuploader');
});

//обрабатываем пост запрос от формы загрузки файлов
app.post('/upload', function (req, res) {
 console.log(req.fields);
 console.log(req.files);  

});

// galleryshow
var getGalleryfiles = require('./galleryfiles').getGalleryFiles;
app.get('/galleryshow',(req,res)=>{

    getGalleryfiles();
    res.render('galleryshow');
});

//---errors
app.use(function(req,res){
   // res.type('text/plain');
    res.status(404);
    res.render('404');
   // res.send('404 -Not Found');    
});

//
//Обработчик ошибок
app.use(function(err,req,res,next){
  //  res.type('text/plan');
  console.error(err.stack);
    res.status(500);
    res.render('500');
  //  res.send('500 -Server Errror');
});

//функция стартует сервер
function startServ(){
    //start
    app.listen(app.get('port'),function(){
    console.log("Express listen on http://localhost: " + app.get('port') + ' process pid ' + process.pid);
    });
};

    //
    if (require.main===module){//при запуске скрипта непосредственно
      // Приложение запускается непосредственно;
      // запускаем сервер приложения
        
        startServ();
    }else{ //при кластеризации запуска из acluster
      // Приложение импортируется как модуль
      // посредством "require":
      // экспортируем функцию для создания сервера
       module.exports.startServ = startServ; // экспорт ф-ции старта сервера для acluster.js
      };
    
