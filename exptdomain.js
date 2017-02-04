//
//module.exports = 

//appuseDomain = 
app = require('./ournet.js').app;
app.use((req,res,next)=>{
   // создаем домен для этого запроса
    var domain = require('domain').create();
    // обрабатываем ошибки на этом домене
    domain.on('error',(err)=>{
        console.error('except domain error\n', err.stack);
        try{
                // Отказобезопасный останов через 5 секунд
                setTimeout(()=>{
                    console.error('serv will be stoped! ');
                    process.exit(1);                
                },5000);
                // Отключение от кластера
                var worker = require('cluster').worker;
                if(worker) worker.disconnect();
                // Прекращение принятия новых запросов
                server.close(); 
             try{
                 // Попытка использовать маршрутизацию
                 // ошибок Express
                 next(err);
             } catch(err){
                 // Если маршрутизация ошибок Express не сработала
                 // пробуем выдать текстовый ответ Node
                 console.error('crash error processing ' + 'Express .\n', err.stack);
                 res.statusCode = 500;
                 res.setHeader = ('content-type','text/plain')
                 res.end = ('We have server error :(');
                }//catch        
        } catch(err){
                 console.error('Cant send response 500.\n', err.stack);
          }
    });//domain.on

    // Добавляем объекты запроса и ответа в домен
    domain.add(req);
    domain.add(res);
    // Выполняем оставшуюся часть цепочки запроса в домене
    domain.run(next);  
}); 

