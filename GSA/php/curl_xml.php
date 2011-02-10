<?php

// 1. set variables
$query = $_GET['query'];
$gsa_url = ('http://gsa.uakron.edu/search?&site=dbCrawTestULResearchTools&client=UL_FE_01&output=xml_no_dtd&getfields=*&num=100&filter=0&proxyreload=1&q=journal');

// 2. initialize cURL
$ch = curl_init($gsa_url);

// 3. set options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);

// 4. execute and fetch the resulting html output
$results = curl_exec($ch);

// 5. close the cURL
curl_close($ch); 

// handle the xml data parsing
$xml = new SimpleXmlElement($results, LIBXML_NOCDATA);
 
// Do some testing with the data using print_r();
// We gotta see what info we need
 



?>