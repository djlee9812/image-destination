function processImage() {
    var subscriptionKey = '34e6e96447014c988a6ccf64ecb3f221';
    var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";
    // Request parameters.
    var params = {
        "visualFeatures": "Categories,Description,Color",
        "details": "Landmarks",
        "language": "en",
    };

    // Display the image.
    var sourceImageUrl = document.getElementById("inputImage").value;
    document.querySelector("#sourceImage").src = sourceImageUrl;

    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })

    .done(function(data) {
        // Show formatted JSON on webpage.
        filter(data)
        //console.log(data)
    })

    .fail(function(jqXHR, textStatus, errorThrown) {
        // Display error message.
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};

function filter(data) {
    //count scores to see which results
    let scores = {
        city: 0,
        nature: 0,
        forest: 0,
        beach: 0,
        rural: 0,
        historical: 0
    }
    let descriptions = data.description.tags
    //count landmarks
    /*let landmark = ""
    if(typeof(data.categories[0].detail.landmarks[0]) !== 'undefined') {
        landmark = data.categories[0].detail.landmarks[0].name
        //console.log(landmark)
    }*/
    //arrays of descriptors 
    //use dictionary hash
    const city = ["building", "subway", "car", "street", "traffic", "skyscraper", "river", "bridge", "light", "tower"]
    const beach = ["sand", "ocean", "water", "blue", "reef", "palm", "towel"]
    const nature = ["rock", "ocean", "water", "animal", "field", "green", "flower", "tree", "river", "plant", "mountain"]
    const forest = ["water", "tree", "green", "brown", "grass", "wood", "plant", "flower"]
    const rural = ["farm", "animal", "grass", "field", "cow", "sheep", "hill", "plant", "pasture", "herd"]
    const historical = ["old", "church", "stone", "brick", "statue","castle", "park"]
    //iterate each tag
    for (var i=0; i< Math.min(descriptions.length, 10); i++) {
        // do something to give ratings to each category      
        if(descriptions[i] === "nature"){
            scores.nature += 5
            continue
        }
        if(descriptions[i] === "city"){
            scores.city += 5
            continue
        }
        if(descriptions[i] === "beach"){
            scores.beach += 5
            continue
        }
        if(descriptions[i] === "rural" || descriptions[i] === "country" || descriptions[i] === "countryside"){
            scores.rural += 5
            continue
        }
        if(descriptions[i] === "forest"){
            scores.forest += 5
            continue
        } 
        for(x in beach){
            if (descriptions[i] === beach[x]) {
                scores.beach += 1
                continue 
            }
        }
        for(x in nature){
            if (descriptions[i] === nature[x]) {
                scores.nature += 1
                continue 
            }
        }
        for(x in city){
            if (descriptions[i] === city[x]) {
                scores.city += 1
                continue 
            }
        }
        for(x in rural){
            if (descriptions[i] === rural[x]) {
                scores.rural += 1
                continue 
            }
        }
        for(x in forest){
            if (descriptions[i] === forest[x]) {
                scores.forest += 1
                continue 
            }
        }
        for(x in historical){
            if (descriptions[i] === historical[x]) {
                scores.historical += 1
                continue
            }
        }
    }
    //use callback to solve synchronous problem
    order(scores, function(items){
        $("#results").html("");
        items.sort(function(a, b) {
            return a.score - b.score
        });
        if(items.length > 7){
            items = items.slice(0,7)
        }
        console.log(items)
        fares(items[0].code, function(price) {
            items[0].fare = price;
            results(items[0], 0);
            fares(items[1].code, function(price) {
                items[1].fare = price;
                results(items[1], 1);
                fares(items[2].code, function(price) {
                    items[2].fare = price;
                    results(items[2], 2);
                    fares(items[3].code, function(price) {
                        items[3].fare = price;
                        results(items[3], 3);
                        fares(items[4].code, function(price) {
                            items[4].fare = price;
                            results(items[4], 4);
                            fares(items[5].code, function(price) {
                                items[5].fare = price;
                                results(items[5], 5);
                            });
                            fares(items[6].code, function(price) {
                                items[6].fare = price;
                                results(items[6], 6);
                            });
                        });
                    });
                });
            });
        });      
    });
}


function order(scores, callback){
    var items = [];
    $.getJSON( "data.json", function( data ) {
        $.each( data, function( key, val ) {
            //do comparison here, put min 5
            val.score = 0
            for(i in scores){
                val.score += Math.sqrt(Math.pow(scores[i] - data[key].type[i], 2))
                data[key].fare = 0

            }
            items.push(data[key]);
        });
        callback(items);
        return;
    });
}

function results(item, i){
    let dollars = ''
    for (i=0; i<item.cost; i++){
        dollars += '<i class="fa fa-usd" aria-hidden="true"></i>'
    }
    var html = [
    '<div class="result col-md-6">',
    '<h1 class="heading">' + item.place + ', ' + item.country + '</h1>',
    '<p>Travel Costs: ' + dollars + '</p>',
    '<p>Lowest roundtrip airfare from your location: <i class="fa fa-usd" aria-hidden="true"></i>' + item.fare + '</p>',
    '</div>',
    '<div class="result col-md-6">',
    '<img class="dest-img" src="' + item.pic + '"/>',
    '</div>'
    ].join("\n");
    $("#results").append(html)
}

function clear() {
}

function fares(dest, callback) {
    $.ajax({url: "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?origin=BOS&destination=" + dest + "&departure_date=2017-10-15&return_date=2017-10-21&number_of_results=3&apikey=INyVXYYjr3fOYl1QYFAZN5nwKC6lat9f", success: function(result){
        console.log(result.results[0]);
        callback(result.results[0].fare.total_price);
        return;
    },error: function(xhr, status, error){
        console.log(status)
    }});
}


