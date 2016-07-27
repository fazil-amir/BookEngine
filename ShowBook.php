<!DOCTYPE html>
<html>
<head>
	<title>Google Book Store</title>
	
	<link rel="stylesheet" type="text/css" href="Includes/Primary.css">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1">
</head>
<body>

<div class="Container ShowBook" >
	
	<section class="SearchContainer">
		<div class="SearchWrapper" id="SearchBook">

			<div>
				<input type="text" id="Title" placeholder="Enter Title" autofocus >				
			</div>

			<div>
				<button>search</button>
			</div>

		</div>
	</section>


	<section id="SearchedBook"></section>
</div>

<script type="text/javascript" src="https://code.jquery.com/jquery-3.0.0.min.js"></script>
<script type="text/javascript" src="Includes/DocumentReady.js" ></script>
</body>
</html>