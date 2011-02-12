$(document).ready(function(){	
	
	// set GSA query string variables based on hidden form fields
	var gsaURL = $('#gsaURL').attr('value');
		site = $('#site').attr('value');
		client = $('#client').attr('value');
		output = $('#output').attr('value');
		metaFields = $('#metaFields').attr('value');
		requiredFields = $('#requiredFields').attr('value');
		num = $('#num').attr('value');
		filter = $('#filter').attr('value');
	
	$('a.filter').click(function(mouseEvent){
		mouseEvent.preventDefault();
		var query = $('#query').attr('value');
		alert (requiredFields);
		
		if ($(this).is('.active')) {
			
			
			if (requiredFields.indexOf("." + $(this).attr('href')) !== -1) {
				var rep = '';
				var rem = '.' + $(this).attr('href');
				requiredFields = requiredFields.replace(rem, rep);
			} else if (requiredFields.indexOf($(this).attr('href') + ".") !== -1 && requiredFields.indexOf("." + $(this).attr('href')) !== 1 ) {
				var rem = $(this).attr('href') + '.';
				var rep = '';
				requiredFields = requiredFields.replace(rem, rep);
			} else {
				var rem = $(this).attr('href');
				var rep = '';
				requiredFields = requiredFields.replace(rem, rep);
			}
				
			// set AJAX properties and query string variables for curl.php
			$.ajax({
				type: "POST",
				url: "php/curl.php",
				dataType: "xml",
				data: {
					num: num,
					filter: filter,
					requiredFields: requiredFields,
					gsaURL: gsaURL,
					query: query,
					site: site,
					client: client,
					output: output,
					metaFields: metaFields
				},
				success: parseXML
			}); // close ajax
			$(this).removeClass('active');
		} else {
			$(this).addClass('active');
			if (requiredFields.indexOf(":") !== -1) {
				requiredFields += ".";	
			}
			requiredFields += $(this).attr('href');
			
			// set AJAX properties and query string variables for curl.php
			$.ajax({
				type: "POST",
				url: "php/curl.php",
				dataType: "xml",
				data: {
					num: num,
					filter: filter,
					requiredFields: requiredFields,
					gsaURL: gsaURL,
					query: query,
					site: site,
					client: client,
					output: output,
					metaFields: metaFields
				},
				success: parseXML
			}); // close ajax

		}
		return false;
	}); // close click
	
	// form which makes an AJAX request to curl.php
	$('#gsa').submit(function(){
		
		query = $('#query').attr('value');
		
		// set AJAX properties and data to send to curl.php
        $.ajax({
            type: "POST",
			cache: false,
            url: "php/curl.php",
            dataType: "xml",
            data: {
				num: num,
				filter: filter,
				requiredFields: requiredFields,
                gsaURL: gsaURL,
                query: query,
                site: site,
                client: client,
                output: output,
                metaFields: metaFields
            },
            success: parseXML
        }); // close ajax
        return false;
    }); // close form
	
	// parse the XML
    function parseXML(xml){	

		$('#results').remove();
		$('#results-nav').remove();
		$('#spelling').remove();
		// remove the results when a new query is made		
	
		// check for spelling suggestions
		if ($(xml).find('Spelling')) {
			// find and format the spelling suggestion
			$(xml).find('Spelling').each(function(){
				$(this).find('Suggestion').each(function(){
					var suggestion = $(this).attr('q');
					$('#content').append('<h3 id="spelling">Did you mean: <a href="' + suggestion + '" id="suggestion">' + suggestion + '</a>?</h3>');
				});
			}); // close find spelling
			
			$('#suggestion').click(function(event){
				// prevent default anchor tag functionality
		        event.preventDefault();
				
				// set the search query to the href property of the query suggestion anchor tag
				query = $(this).attr('href');
				// set the text in the search query field to the value of the query variable
				$('#query').val(query);
				// set AJAX properties and query string variables for curl.php
		        $.ajax({
		            type: "POST",
		            url: "php/curl.php",
		            dataType: "xml",
		            data: {
						num: num,
						filter: filter,
						requiredFields: requiredFields,
		                gsaURL: gsaURL,
		                query: query,
		                site: site,
		                client: client,
		                output: output,
		                metaFields: metaFields
		            },
		            success: parseXML
		        }); // close ajax
				return false;
		    }); //close click 
		} //close spelling if
		
		var html = '<div id="results-nav" class="listNav"></div>';
		//open the Results UL
		html += '<ul id="results">';
		// Find each result and format it		
        $(xml).find('R').each(function(){
            var num = $(this).attr('N') + ". ";
				url = $(this).find('U').text();
				title = $(this).find('T').text();
				snippet = $(this).find('S').text();
				
			html += '<li class="result ';
				
			$(this).find('MT:[N="research"]').each(function(){
				var toolTypes = $(this).attr('V');
				html += toolTypes + ' ';
			}); // close toolTypes
			
			$(this).find('MT:[N="subject"]').each(function(){
				var subjects = $(this).attr('V');
				html += subjects;
			}); //close subjects
            
            if ($(this).find('MT:[N="librarianRecommended"]').attr('V')) {                 
          		html += ' librarianRecommended'
            } 
			html += '">';	
			html += '<h3 class="title"><a href="' + url + '" class="url">' + title + '</a></h3>';
			html += '<ul class="resultDetails">';
			html += '<li class="resultSnippet">' + snippet +'</li>';
			html += '</ul></li>';	
        }); // close find result
        html += '</ul>'; // close the Results UL
        
		//append the results to the #content DIV
		$('#content').append(html); 
		$('#results').listnav();		
    } // close parseXML
}); // close docready