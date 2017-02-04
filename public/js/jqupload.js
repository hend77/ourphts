//
 (function(){
 //   var result={};
 //       result.evn ={};
 //       result.mess={};
 //       result.data ={};

    var progress = {};
        //
    //  var enforceMaximumSize = function (file) {
    //    return new Promise(function (resolve) {
   //       var reader = new FileReader();
//
   //       reader.onload = function (evt) {
   //         var image = new Image();
//
    //        image.onload = function () {
    //          var error = (this.size > 250000 ) ? "Error: rule: 250kb, given: " + this.size : null;
    //          resolve(error);
    //        };
//
    ///        image.src = evt.target.result;
     //     };
//
    //      reader.readAsDataURL(file);
     //   });
     // }        

       // liteUploader plugin init
      $(".fileUpload").liteUploader({
        script: "/upload",
       // validators: [enforceMaximumSize],
        rules: {
          //allowedFileTypes: "image/jpeg,image/png,image/gif",
          maxSize: 1000000,          
        }        

      })
      .on("lu:errors", function (e, errors) {
        //console.log(errors);
        var el = document.querySelector("pre");
        el.innerHTML = el.innerHTML + 'Ошибка при загрузке, не должно быть файлов больше 1МБ' + '\r\n';

      })      
      .on("lu:before", function (e, files) {    
        var fileName = files[0].name;
        progress[fileName] = 0; 

        var el = document.querySelector(".preview");

        Array.prototype.forEach.call(files, function (file) {
          var reader = new FileReader();

          reader.onload = function (e) {
            var image = document.createElement("img");
            image.src = e.target.result;
            //
            image.setAttribute('class','rubberBand img-thumbnail uploadview');
            
            el.appendChild(image);
          };

          reader.readAsDataURL(file);
        });                        
      })
      .on("lu:progress", function (e, state) {
        
        for(var i=0;i<=state.files.length;i++){
            var filename = state.files[i].name;//[i]
            var percent = state.percentage;
            //progress['Имя файла'] = fileName; //state.percentage;
            //progress['Загружен:'] = state.percentage + ' %';
            var el = document.querySelector("pre");            
           // el.innerHTML = JSON.stringify(progress, null, 2);
           el.innerHTML = el.innerHTML + 'Файл: ' + filename  + ' загружен: ' + percent + ' %' + '\r\n'; 
        }
      })            
      .on("lu:success", function (e, response) {
        console.log(response);
      });

       // on change file upload
        $(".fileUpload").change(function () {
        $(this).data("liteUploader").startUpload();
        //
      });

   //   return result;

 }());