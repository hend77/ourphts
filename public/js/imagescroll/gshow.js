		(function() {
            $(document).ready(	
              $(function() {
			    	$('#tj_container').gridnav({
                            rows    : 3, // число строк которые будут показаны
                            navL    : '#tj_prev', // селектор для навигации "назад"
                            navR    : '#tj_next', // селектор для навигации "вперед"
					    type	: {
						    mode		: 'disperse', 	// use def | fade | seqfade | updown | sequpdown | showhide | disperse | rows
						    speed		: 500,			// for fade, seqfade, updown, sequpdown, showhide, disperse, rows
						    easing		: '',			// for fade, seqfade, updown, sequpdown, showhide, disperse, rows	
						    factor		: '',			// for seqfade, sequpdown, rows
						    reverse		: ''			// for sequpdown
					     }
				});
			}));
        })();