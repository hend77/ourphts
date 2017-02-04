
var fs = require ('fs');
var sys = require('sys');

//
module.exports.getGalleryFiles = getGalleryFiles;

function getGalleryFiles(){
    let result = true;
    //
    let partDir = __dirname + '\\views\\partials\\';
    let uploadDir = __dirname + '\\public\\uploads\\';    
    //
    let listr = '<li><a href="#"><img ? /></a></li>'; //? will be replaced 
   // let charpos = listr.indexOf('?'); //
    //
    let contentList =[];

        // читаем список файлов каталога 
         fs.readdir(uploadDir,  (err,items)=>{ //??
        
             
             items.forEach((item,i,arr)=>{                                    
             contentList.push(listr.replace('?','src="uploads\\' + item + '"'));
             //                              
             });
         });
        // 

  fs.open(partDir + 'gallery.handlebars','w',0644, 
      function(err, file_handle) {
         if (err) throw err; //error
	 	//-- 

        fs.write(file_handle,contentList.join('\n'),null,'utf8', 
	     function (err,writen) {
	      if (err) {
              throw err; 
            } else{console.log('Well done! partials is writed')}
	       }
	    );
	    //--
   
     }); //fs.open  

};