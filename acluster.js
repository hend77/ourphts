
// кластеризация, запускаем workers на ядрах

  cluster = require('cluster');//модуль для кластеризации

    function startWorker(){
             worker = cluster.fork();
            console.log('cluster: worker %d started', worker.id);    
        }

    if(cluster.isMaster){//запуск модуля
        require('os').cpus().forEach(function(){
            startWorker();
        });
        //Обработчики событий кластера
        cluster.on('listening', (worker, address) => {
             console.log(
                'A worker is now connected to adress: %d port: %d ', address.address, address.port );
        });
        //
        cluster.on('message', function(worker, message, handle) {
        if (arguments.length === 2) {
            handle = message;
            message = worker;
            worker = undefined;
        }
        console.log('cluster: worker %d pid %d recive message',worker.id, process.pid);
        });        
        //
        // Записываем в журнал всех отключившихся
        // исполнителей;
        // Если исполнитель отключается, он должен затем
        // завершить работу, так что мы подождем
        // события завершения работы для порождения
        // нового исполнителя ему на замену        
        cluster.on('disconnect',function(worker){
            console.log('cluster: worker %d disconnect from cluster',worker.id);            
        });
        // Когда исполнитель завершает работу,
        // создаем исполнителя ему на замену        
        cluster.on('exit',function(worker,code,signal){
             console.log('cluster: worker %d stoped with code %d (%s)',worker.id, code,signal);
             startWorker();
        });
       
    }else{//запуск исполнителя
        //Запускаем наше приложение на исполнителе;
       require('./autorize.js').startServ(); //
    }    
//
//Когда этот JavaScript выполняется, он будет находиться либо в контексте
//основного приложения (когда он запускается непосредственно с помощью node
//meadowlark_cluster.js), либо в контексте исполнителя, когда его выполняет кластер-
//ная система Node. В каком именно контексте выполняется, определяют свойства
//cluster.isMaster и cluster.isWorker.
