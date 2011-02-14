function addListItem(obj) {
   selectedItemId = obj.attr("id") + "_clone";
   obj.clone(true, true).attr("id", selectedItemId ).appendTo($("#activeFilters"));
   obj.hide();
 }

function delListItem(obj) {
	itemId = obj.attr("id");
	cloneParentId = itemId.substring(0,itemId.lastIndexOf("_")); 
	$("#" + itemId).remove();
	$("#" + cloneParentId).show().children().removeClass('active');
	
}

$(document).ready(function(){	

/*================================================================================================
 * VARIABLES
 * 
 * This next block of code sets the search query variables based on the value(s) #query field of a
 * form element, and hidden fields of that form element.
 * 
 * 
 ================================================================================================*/

	// set GSA query string variables based on hidden form fields
	var gsaURL = $('#gsaURL').attr('value');
		site = $('#site').attr('value');
		client = $('#client').attr('value');
		output = $('#output').attr('value');
		metaFields = $('#metaFields').attr('value');
		requiredFields = $('#requiredFields').attr('value');
		num = $('#num').attr('value');
		filter = $('#filter').attr('value');

/*================================================================================================
 *  AJAX FUNCTION
 * 
 * This block of code is responsible for sending the search query data to the PHP cURL, which
 * then sends that data to the GSA, which returns to the search results to the cURL script. The
 * results are then echoed out, by the PHP script, as XML, which is loaded, by this AJAX function,
 * for processesing by the parseXML function *
 *  
 ================================================================================================*/
		
	// set AJAX properties and query string variables for curl.php
	function getResults(num, filter, requiredFields, gsaURL, query, site, client, output, metaFields){
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

/* ================================================================================================
 * FILTER CLICK FUNCTION
 * 
 * This function handles the functionality of the filter anchor-tag-based elements.
 * 
 =============================================================================================== */	
	$('a#reset').click(function(mouseEvent){
		mouseEvent.preventDefault();

		$('#query').val('');
		requiredFields = ('');
		$('#results').remove();
		$('#results-nav').remove();
	//	$('#results').fadeOut(1000, function(){$(this).remove();});
	//	$('#results-nav').fadeOut(1000, function(){$(this).remove();});
		
		return false;
	});
	        

	$('a.filter').click(function(mouseEvent){
		mouseEvent.preventDefault();
		var query = $('#query').attr('value');
		
		// Checks to see if the filter has an active class
		if ($(this).is('.active')) {
			// This next if/else-if statement removes periods between required fields in the GSA query string
			if (requiredFields.indexOf("." + $(this).attr('href')) !== -1) {
				var rep = '';
				var rem = '.' + $(this).attr('href');
				requiredFields = requiredFields.replace(rem, rep);
			} else if (requiredFields.indexOf($(this).attr('href') + ".") !== -1 && requiredFields.indexOf("." + $(this).attr('href')) !== 1) {
					var rem = $(this).attr('href') + '.';
					var rep = '';
					requiredFields = requiredFields.replace(rem, rep);
			} else {
					var rem = $(this).attr('href');
					var rep = '';
					requiredFields = requiredFields.replace(rem, rep);
			}
			
			// Call the getResults AJAX function
			
			
			//delListItem($(this).parent());
				
				itemId = $(this).parent().attr("id");
				cloneParentId = itemId.substring(0,itemId.lastIndexOf("_"));
					
				alert(itemId);
				alert(cloneParentId);
				$("#" + itemId).remove();
				$("#" + cloneParentId).show();
			
			//remove the active class from the filter
			
			getResults (num, filter, requiredFields, gsaURL, query, site, client, output, metaFields);
			
			$(this).removeClass('active');
			
		// if the filter is inactive, proceed to filter the results	
			return false;
			
		} else {
			$(this).addClass('active');
			
			// checks to see if there is already a filter in the query string and if it is, it adds a period between the new filter and itself
			if (requiredFields.indexOf(":") !== -1) {
				requiredFields += ".";	
			}
			requiredFields += $(this).attr('href');
			
			// Call the getResults AJAX function
			getResults(num, filter, requiredFields, gsaURL, query, site, client, output, metaFields);
			
			var selectedItemId = $(this).parent().attr("id") + "_clone";
			
			alert(selectedItemId);
   			
			$(this).parent().clone(true, true).attr("id", selectedItemId ).appendTo($("#activeFilters"));
   			$(this).parent().hide();
			
		}
		return false;
	}); // close click
	
	/* ================================================================================================
	 * FORM SUBMISSION FUNCTION
	 * 
	 * This function handles the form-submission functionality
	 * 
	 =============================================================================================== */
	
	$('#gsa').submit(function(){
		
		query = $('#query').attr('value');
		requiredFields = $('#requiredFields').attr('value');
		
		// Call the getResults AJAX function
		getResults(num, filter, requiredFields, gsaURL, query, site, client, output, metaFields);
		return false;
    }); // close form
	
	/* ================================================================================================
	 * 
	 * PARSE XML FUNCTION
	 * 
	 * This function parses the XML that the Google Seach Appliance returns
	 * 
	 ================================================================================================ */
	
	// parse the XML
    function parseXML(xml){	
		
		$('#results').remove();
		$('#results-nav').remove();
		$('#spelling').remove();
		// remove the results when a new query is made		
	
		/* ================================================================================================
		 * CHECK FOR SPELLING SUGGESTIONS
		 * 
		 * This next bit of code checks for spelling suggestions and provides a clickable link that
		 * allows a user to re-submit their search query with the correctly-spelled query 
		 =============================================================================================== */
		
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
				
				// Call the getResults AJAX function
				getResults(num, filter, requiredFields, gsaURL, query, site, client, output, metaFields);
				
				return false;		
		    }); //close click 
		} //close spelling if
		
		/* ================================================================================================
		 * PARSE RESULTS IF NO SPELLING ERRORS ARE FOUND
		 ================================================================================================ */
		
		var html = '<div id="results-nav" class="listNav"></div>';
		//open the Results UL
		html += '<ul id="results">';
		// Find each result and format it		
        $(xml).find('R').each(function(){
            var num = $(this).attr('N') + ". ";
				url = $(this).find('U').text();
				title = $(this).find('T').text();
				snippet = $(this).find('S').text();
				inode = $(this).find('MT:[N="inode"]').attr('V');
				detailsURL = 'https://www.uakron.edu/libraries/bierce_scitech/research_tools/research_tools_detail.dot?id=' + inode;
				
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
			html += '<h3 class="title"><a href="' + url + '" class="url">' + title + '</a>';
			if ($(this).find('MT:[N="librarianRecommended"]').attr('V')) {
				html+= '<span class="librarianRecommended"><img src="img/thumbs_up.png" alt="Librarian Recommended" />Librarian Recommended</span></h3>';
			} else {
				html+= '</h3>'
			}
			html += '<ul class="resultDetails">';
			html += '<li class="resultSnippet">' + snippet +'</li>';
			html += '<li><a href="' + detailsURL + '">More Details</a></li>';
			html += '</ul></li>';	
        }); // close find result
        html += '</ul>'; // close the Results UL
        
		//append the results to the #content DIV
		$('#content').append(html); 
		$('#results').listnav();		
    } // close parseXML
}); // close docready