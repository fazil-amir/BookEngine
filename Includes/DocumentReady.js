$(document).ready(function() {

    /*==================================================================================
    	CHECK IOS DEVICES
    ==================================================================================*/
    var CheckIfIOS = function() {

        if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {

            return true;

        }
    }


    if (CheckIfIOS()) {

        //If the device is IOS then give the element a special attention
        $('#SearchBook').find('input').addClass('SearchBookIOS');

    }


    SB = new SearchBook(window, document);
    SB.Init({

        'ParentSelector': '#SearchBook',
        'SuggestionSelector': '.TitleSuggestion'

    });


    $(this).on('keyup', function(e) {

        //On escape clear the autocomplete and reset the search

        if (e.keyCode == 27) {

            SB.ResetSearch();

        }


        //Search only if you have 3 or more

        if ($('#Title').val().length >= 3) {

            SB.SearchBookWithTitle();

        }


        //Also if the lengh is null the reset the autocomplete
        else if ($('#Title').val().length == 0) {

            SB.ResetSearch();

        }

    });

    $('button').on('click', function() {

        var QueryString =  $('#Title').val().replace(/[^a-zA-Z0-9]/g, '');
        window.location = 'SearchBooks.php?ID=' + QueryString;

    });    

    var GetQueryString = function( ) {

        var Queries = {};

        $.each(document.location.search.substr(1).split('&'), function(c, q) {

            var i = q.split('=');
            Queries[i[0].toString()] = i[1].toString();

        });

        return Queries.ID;

    }


    if ( $('.ShowBook').length > 0 ) {

        SB.ShowBookDetailByID( GetQueryString() );

    }

    if( $('.SearchBooks').length > 0 ) {

        SB.ShowMatchingBooks( GetQueryString() );

    }


});

var SearchBook = (function(window, document, undefined) {

    //Our Public DOM Attributes

    this.DOM = {
        'ParentSelector': '#SearchBook',
        'SuggestionSelector': '.TitleSuggestion',

        'SearchedBook': {
            'Parent': '#SearchedBook',
            'Container': '.BookWrapper',
            'Headline': '.Headline',
            'SectionLeft': '.SectionLeft',
            'SectionRight': '.SectionRight',
            'CoverImage': '.CoverImage',
            'Row': '.Row',
            'BookWrapper': '.BoxWrapper',
            'BookDescription': 'BookDescription'
        },

    };


    //Now make the variable accessable inside any function

    var that = this;


    /*==================================================================================
    	CONSTRUCTOR
    ==================================================================================*/

    this.Init = function(Options) {

        //Concatinate the objects
        $.extend(that.DOM, Options);

    };



    /*==================================================================================
    	RESET SEARCH
    ==================================================================================*/

    this.ResetSearch = function() {

        $(that.DOM.SuggestionSelector)
            .remove();

        $(that.DOM.ParentSelector)
            .find('input')
            .val('')
            .first()
            .focus();

    };



    /*==================================================================================
    	SEARCH BOOK WITH TITLE
    ==================================================================================*/

    this.SearchBookWithTitle = function() {

        /* ------------------------------------------------------------------
        	APPEND THE AUTOCOMPLETE SEGMENT CONTAINER
        ------------------------------------------------------------------ */

        if ($(that.DOM.SuggestionSelector).length <= 0) {

            var Element = $('<ul>', {

                class: 'TitleSuggestion'

            });

            $(that.DOM.ParentSelector)
                .find('div')
                .first()
                .append(Element);

        }

        //Append the autocomplete item inside the wrapper.
        var SearchItem = $(that.DOM.ParentSelector).find('input').first().val();


        /* ------------------------------------------------------------------
        	CALL THE GOOGLE API
        ------------------------------------------------------------------ */

        $.getJSON('https://www.googleapis.com/books/v1/volumes?q=' + SearchItem + '&limit=10&key=AIzaSyA9h83UQecaZ1filbg5EM6Zfe_WJPMJqFg', function(Data) {


            // Make an empty array to store only the matched title

            var Title = [];


            // Split the array so that we can find the matching title with the user query

            var ReturnedString = Data.items[0].volumeInfo.title
                .replace(/\s{2,}/g, ' ')
                .toLowerCase()
                .split(' ');


            // Loop the array we created and push the data to Title array

            $.each(ReturnedString, function(I, Value) {

                var Element = $('<li>', {

                    html: '<a href="ShowBook.php?ID=' + Data.items[I].id + '">' + Data.items[I].volumeInfo.title + '</a>',
                    id: Data.items[I].id

                })


                // Push the li elements to Title array

                Title.push(Element);


                // Filter out the unique once only

                Title = $.unique(Title);

            });


            //Append the title array in ul

            $('.TitleSuggestion').html(Title);


        });

    };



    
    this.ShowBookDetailByID = function(ID) {

        $.getJSON('https://www.googleapis.com/books/v1/volumes?q=id:' + ID + '&limit=10&key=AIzaSyA9h83UQecaZ1filbg5EM6Zfe_WJPMJqFg', function(Data) {

            if( ! Data.items ) {
                alert('Book not found');
                window.location = 'Index.php';
            }

            var Key = "";
            var BookData = {};

            $.each(Data.items[0], function MakeObject(Keys, Values) {

                var SaveKey = Key;

                SaveKey = SaveKey ? Keys : Keys;

                if (typeof Values === "object") {

                    // Recurse into children

                    $.each(Values, MakeObject);

                } else {

                    BookData[SaveKey] = Values

                }

                Key = SaveKey;

            });




            /* ------------------------------------------------------------------
            	RENDER THE WRAPPER INSIDE PALCEHOLDER WE HAVE IN HTML
            ------------------------------------------------------------------ */

            that.RenderHTML(that.DOM.SearchedBook.Parent, '<div />', that.DOM.SearchedBook.Container);



            /* ------------------------------------------------------------------
            	RENDER HEADLINE AND SET TITLE
            ------------------------------------------------------------------ */

            that.RenderHTML(that.DOM.SearchedBook.Container, '<div />', that.DOM.SearchedBook.Headline, BookData.title);



            /* ------------------------------------------------------------------
            	RENDER THE COVER IMAGE
            ------------------------------------------------------------------ */

            // Create the left section segment floating to left for cover image to place in it

            that.RenderHTML(that.DOM.SearchedBook.Container, '<div />', that.DOM.SearchedBook.SectionLeft);


            // We always might not have the cover image so when the image is broken show the 404 image

            if (BookData.thumbnail) {

                var ImageTag = '<img src="' + BookData.thumbnail + '" title="' + BookData.title + '" alt="' + BookData.title + '" />';

            } else {

                var ImageTag = '<img src="Includes/MissingCover.png" />';

            }

            // Render the image we created.
            
            that.RenderHTML(that.DOM.SearchedBook.SectionLeft, '<div />', that.DOM.SearchedBook.CoverImage, ImageTag);


            
            /* ------------------------------------------------------------------
            	RENDER THE RIGHT SECTION FOR DISPLAYING VOLUME INFO
            ------------------------------------------------------------------ */

            that.RenderHTML(that.DOM.SearchedBook.Container, '<div />', that.DOM.SearchedBook.SectionRight);

            $.each(BookData, function(Key, Value) {

                var Str;

                if (Key == 'title' || Key == 'identifier' || Key == 'publishedDate' || Key == 'publisher') {

                    Str = '<span>' + that.GetNormalString(Key) + '</span>' + Value;

                } else if (Key == 'description') {

                    Str = '<hr /><span>' + that.GetNormalString(Key) + '</span><br />' + Value + '<hr />';

                } else if (Key == 'webReaderLink' || Key == 'infoLink' || Key == 'canonicalVolumeLink') {

                    Str = '<a target="_blank" href="' + Value + '&key=AIzaSyA9h83UQecaZ1filbg5EM6Zfe_WJPMJqFg">' + that.GetNormalString(Key) + '</a>';

                }

                
                // Insert
                
                that.RenderHTML(that.DOM.SearchedBook.SectionRight, '<div />', that.DOM.SearchedBook.Row, Str);

            });

        });

    };


    

    this.ShowMatchingBooks = function(Q) {

        var BookData = {};

        $.getJSON('https://www.googleapis.com/books/v1/volumes?q=' + Q + '&limit=15&key=AIzaSyA9h83UQecaZ1filbg5EM6Zfe_WJPMJqFg', function(Data) { 
        
            that.RenderHTML(that.DOM.SearchedBook.Parent, '<div />', that.DOM.SearchedBook.Container);
            var BoxCount = 1;
            $.each( Data.items, function(Key, Value) {

                
                var BookData = {
                    
                    ID           : Value.id,
                    Title        : ( Value.volumeInfo.title.length > 25 ? Value.volumeInfo.title.substr(0, 25 ) : Value.volumeInfo.title ),
                    Thumbnail    : ( Value.volumeInfo.hasOwnProperty('imageLinks') ? Value.volumeInfo.imageLinks.thumbnail : 'Includes/MissingCover.png')
                }

                
                var Class = that.DOM.SearchedBook.BookWrapper + ' .Box' + BoxCount;
                
                that.RenderHTML(that.DOM.SearchedBook.Container, '<div />', Class )

                var HTML  = '<img src="' + BookData.Thumbnail + '" title="' + BookData.Title + '"/><div class="' + that.DOM.SearchedBook.BookDescription + '">' + BookData.Title + '</div><a title="' + Value.volumeInfo.title + '"href="ShowBook.php?ID=' + BookData.ID + '"></a>';
       
                that.RenderHTML('.Box' + BoxCount, '<div />', that.DOM.SearchedBook.CoverImage, HTML );

                BoxCount = BoxCount + 1;
            }); 
            

        })

    };


    

    this.RenderHTML = function(Parent, ChildElement, ChildClass, HTML = '') {        
        
        ChildClass = ChildClass.replace('.', '').replace('.', '');

        var Element = $(ChildElement, {

            class: ChildClass,
            html: HTML

        });

        $(Parent).append(Element);

    };



    
    this.CheckStringValue = function(Value) {


        return ((Value.trim() != '' ? true : false));

    };



    
    this.GetNormalString = function(RawString) {

        RawString = RawString
            .split(/(?=[A-Z])/)
            .join(' ');

        return RawString;
    
    };



});