$(document).ready(function(){
		
	$(window).bind( "hashchange", function(e) {
		var filters = e.getState("activeFilters");		   
		console.log(filters);

	});	
	
	/* ===============================================================================================
	 * REMOVE DUPLICATE ELEMENTS FUNCTION																	 * 
	 =============================================================================================== */

	function removeDuplicateElement(arrayName)
      {
        var newArray = new Array();
        label:for(var i=0; i<arrayName.length;i++ )
        {  
          for(var j=0; j<newArray.length;j++ )
          {
            if(newArray[j]==arrayName[i]) 
            continue label;
          }
          newArray[newArray.length] = arrayName[i];
        }
        return newArray;
      }

	/* ===============================================================================================
	 * GET URL VARIABLES
	 * 
	 * Gets variables passed to this page from another in a URL string
	 * 
	 =============================================================================================== */

	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}
	// sets a query variable based on the query sent to this page
	query = getUrlVars()["query"];
	
	// sets this page's search query text box value equal to what was passed to this page
	$('#query').val(query);

	/* ===============================================================================================
	 * VARIABLES
	 * 
	 * This next block of code sets the search query variables based on the value(s) #query field of a
	 * form element, and hidden fields of that form element.
	 * 
	 =============================================================================================== */

	// set GSA query string variables based on hidden form fields
	var gsaURL = $('#gsaURL').attr('value');
		site = $('#site').attr('value');
		client = $('#client').attr('value');
		output = $('#output').attr('value');
		metaFields = $('#metaFields').attr('value');
		requiredFields = $('#requiredFields').attr('value');
		num = $('#num').attr('value');
		filter = $('#filter').attr('value');
		query = $('#query').attr('value');
		
		// Parses out the resules based on a query passed to this page from another
		getResults (num, filter, requiredFields, gsaURL, query, site, client, output, metaFields);

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
				metaFields: metaFields,
			},
			success: parseXML
		}); // close ajax
	}
	
	/* ================================================================================================
	 * FORM SUBMISSION FUNCTION
	 * 
	 * This function handles the form-submission functionality
	 * 
	 =============================================================================================== */
	
	$('#gsa').submit(function(){
		
		query = $('#query').attr('value');
		query = query.replace(/ /g, '%20');
		query = query.replace(/\'/g, "%27");
		//requiredFields = $('#requiredFields').attr('value');
		$.bbq.pushState({ query: query, requiredFields: requiredFields });
		//check for a hash-change in the URL

		return false;
    }); // close form

	/* ================================================================================================
	 * FILTER CLICK FUNCTION
	 * 
	 * This function handles the functionality of the filter anchor-tag-based elements.
	 * 
	 =============================================================================================== */
	var activeFilters = [];
	$('a.filter').live('click', function(mouseEvent){
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
			
			$.bbq.pushState({requiredFields: requiredFields });
							
			itemId = $(this).parent().attr("id");
			cloneParentId = itemId.substring(0,itemId.lastIndexOf("_"));
				
			$("#" + itemId).remove();
			$("#" + cloneParentId).show().children().removeClass('active');				
			
			return false;
		// if the filter is inactive, proceed to filter the results
		} else {
			$(this).addClass('active');
  			
			var activeFilter = $.trim($(this).text());
				activeFilters.push(activeFilter);
				console.log(activeFilters);		
						
			// checks to see if there is already a filter in the query string and if it is, it adds a period between the new filter and itself
			if (requiredFields.indexOf(":") !== -1) {
				requiredFields += ".";	
			}
			requiredFields += $(this).attr('href');
			
			$.bbq.pushState({requiredFields: requiredFields, activeFilters: activeFilters });
			
			// Call the getResults AJAX function
			//getResults(num, filter, requiredFields, gsaURL, query, site, client, output, metaFields);
			
			// sets a variable based on the href attribute based on the anchor tag's href value
			var filterHREF = $(this).attr('href');
				filterHREF = filterHREF.replace(/[^a-zA-Z 0-9]+/g,''); //remove specials from the variable
			
			// sets the id of the filter anchor tag to the filterHREF variable 	
			$(this).parent().attr('id', filterHREF);
			
			// appends _clone to the id of the cloned filter anchor tag
			var selectedItemId = $(this).parent().attr('id') + "_clone";
   			
			$(this).parent().clone(true, true).attr("id", selectedItemId ).appendTo($("#activeFilters"));
   			$(this).parent().hide();	
		}
		return false;
	}); // close click
	
	/* ================================================================================================
	 * 
	 * PARSE XML FUNCTION
	 * 
	 * This function parses the XML that the Google Seach Appliance returns
	 * 
	 ================================================================================================ */
	
	// parse the XML
    function parseXML(xml){	
		
		$('ul#listOfToolFilters>li').remove();
		$('ul#listOfSubjectFilters>li').remove();
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
					$('#content').append('<p id="spelling">Did you mean: <a href="' + suggestion + '" id="suggestion">' + suggestion + '</a>?</p>');
				});
			}); // close find spelling
			
			$('#suggestion').click(function(event){
				// prevent default anchor tag functionality
		        event.preventDefault();
				
				// set the search query to the href property of the query suggestion anchor tag
				query = $(this).attr('href');
				query = query.replace(/ /g, '%20');
				query = query.replace(/\'/g, "%27");
				// set the text in the search query field to the value of the query variable
				$('#query').val(query);
				
				$.bbq.pushState({query: query});
				
				$('#results-nav').remove();
				return false;		
		    }); //close click 
		} //close spelling if
		
		/* ================================================================================================
		 * PARSE RESULTS IF NO SPELLING ERRORS ARE FOUND
		 ================================================================================================ */
		var	toolList = [];
			subjectList = [];

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
				var toolTypes = $.trim($(this).attr('V'));
				//checks to see if the toolType is in an active filter, and adds it to the toolList array if it isn't
				if ($.inArray(toolTypes, activeFilters) === -1) {
						toolList.push(toolTypes);
					}
				html += toolTypes + ' ';
		
			}); // close toolTypes
			
			$(this).find('MT:[N="subject"]').each(function(){
				var subjects = $(this).attr('V');
					subject = subjects.replace(/ /g, '%20').toLowerCase();
					
					subjectList.push(subject);
				html += subjects + ' ';
			}); //close subjects
            
            if ($(this).find('MT:[N="librarianRecommended"]').attr('V')) {                 
          		html += ' librarianRecommended'
            } 
			html += '">';
			html += '<ul class="resultDetails">';
			html += '<li class="title"><a href="' + url + '" class="url">' + title + '</a>';
			if ($(this).find('MT:[N="librarianRecommended"]').attr('V')) {
				html+= '<span class="librarianRecommended"><img src="img/thumbs_up.png" alt="Librarian Recommended" />Librarian Recommended</span></li>';
			} else {
				html+= '</li>'
			}
			html += '<li class="resultSnippet">' + snippet +'</li>';
			html += '<li class="moreDetailsURL"><a href="' + detailsURL + '">More Details</a></li>';
			html += '</ul></li>';
			
			
        }); // close find result
        html += '</ul>'; // close the Results UL
		//append the results to the #content DIV
		$('#content').append(html);
		
		var listOfTools = removeDuplicateElement(toolList);
			listOfSubjects = removeDuplicateElement(subjectList);

		// loops through the array of research tool types
		$.each(listOfTools, function(itemIndex, toolName){
			var	toolHREF = toolName.replace(/ /g, '%20').toLowerCase(); //URL encodes spaces
				listItem = '<li><a class="filter" href="research:' + toolHREF + '">' + toolName + '</a></li>';
				
			$('#listOfToolFilters').append(listItem);
		});
		
		$('ul.filterList>li').tinysort();
    } // close parseXML

	

    
	/* ===============================================================================================
	 * FILTER LIST SLIDE FUNCTION																	 * 
	 =============================================================================================== */
	$('a.slide').addClass('up').parent().children('ul').slideUp();
	$('a.slide').click(function(mouseEvent){
		mouseEvent.preventDefault();
		
		if ($(this).is('.up')) {
			$(this).removeClass('up').addClass('down').parent().children('ul').slideDown();
		} else {			
			$(this).removeClass('down').addClass('up').parent().children('ul').slideUp();
		}
		return false;
	});
	
	/* ===============================================================================================
	 * RESET FUNCTION																				 * 
	 =============================================================================================== */
	$('a#reset').click(function(mouseEvent){
		mouseEvent.preventDefault();

		$('#query').val('');
		requiredFields = ('');
		$('#results').remove();
		$('#results-nav').remove();
		$('#spelling').remove();
		
		return false;
	});
	
	$(window).bind( "hashchange", function(e) {
			var requiredFields = e.getState("requiredFields");
			query = e.getState("query");   
			// Call the getResults AJAX function
			getResults (num, filter, requiredFields, gsaURL, query, site, client, output, metaFields);
	});
	
	$(window).trigger( "hashchange" );

});