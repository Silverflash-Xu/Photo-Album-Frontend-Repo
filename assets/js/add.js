let label_id = 1
let img_id = 0
let label_arr = [0]
let img_arr = []

function speech() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = $("#status")
    if (SpeechRecognition != undefined) {
        let recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => {
            status.val('Starting listening, speak in the microphone please');
        };

        recognition.onspeechend = () => {
            status.val('I stopped listening');
            recognition.stop();
        };

        recognition.onresult = (result) => {
            $("#search-field").val(result.results[0][0].transcript);
        };
        recognition.start();
    } else {
        alert("sorry not supported");
    }
}


function upload_photo(labels){

    var files = $("#myimg")[0].files;
    if (!files.length) {
        return alert("Please choose a file to upload first.");
    }
    var file = files[0];
    var fileName = file.name;

    let config = {
        headers: { 'Content-Type': files.type, "X-Api-Key": "nlTvuUqMZQ2t6THpQ7cRZYL7HM3uDW41LqSSRif8","x-amz-meta-customLabels": labels}
    };
    let url = 'https://b0em6psfz7.execute-api.us-east-1.amazonaws.com/v1/upload/photoalbumxx/' + fileName;

    getBase64(file).then(data =>
        // console.log(data)
        axios.put(url, data, config).then(response => {
            console.log(response.data)
            $("#myimg").val('')
            for (const i of label_arr){
                if(i != 0){
                    $(".label_row" + i).remove()
                }
            }
            label_id = 1
            label_arr = [0]
            $(".in").val('')
            alert("Upload successful!!");
        })
    );
}

function remove_images() {
    for(const i of img_arr){
        $("#" + i).remove()
    }
    img_id = 0
    img_arr = []
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
}

function search_photos(query) {
    let url = 'https://b0em6psfz7.execute-api.us-east-1.amazonaws.com/v1/search?q=' + query;
    axios.get(url, {
        headers: { "x-api-key": "nlTvuUqMZQ2t6THpQ7cRZYL7HM3uDW41LqSSRif8"}
    }).then(response => {
        console.log(response.data)
        var img_str = response.data
        $("#search-field").val('')
        displayS3Images(img_str)
    })
}

function displayS3Images(img_str) {
    if(img_str){
        let img_list = img_str.split(",")
        console.log(img_list)
        for (const name of img_list) {
            let new_img = $("<img id='" + img_id + "' src='https://photoalbumxx.s3.amazonaws.com/" + name + "'>")
            img_arr.push(img_id)
            img_id = img_id + 1
            $("#res-container").append(new_img)
        }
    }
    else {
        alert("No images found");
    }
}

$(document).ready(function () {
    speech()
    $(document).on('click', '#speech', function () {
        speech()
    })
    $(document).on('click', '#labels_add', function () {
        let new_row = $("<div class='arr_row1 label_row" + label_id +"'></div>")
        let new_honor = $("<input type='text' class='in' id='labels" + label_id + "'>")
        let new_button = $("<button type='button' class='del_but labels_delete' data-name=" + label_id + ">Delete</button><br>")
        label_arr.push(label_id)
        label_id += 1
        $(new_row).append(new_honor)
        $(new_row).append(new_button)
        $("#labels_container").append(new_row)
    })
    $(document).on('click', '.labels_delete', function () {
        let id = $(this).attr('data-name')
        label_arr.splice(label_arr.indexOf(parseInt(id)), 1)
        $(".label_row" + id).remove()
    })
    $(document).on('submit', '#add_form', function (event) {
        event.preventDefault()
        remove_images()
        let label_li = ''
        for (const i of label_arr){
            let cur = $("#labels" + i).val()
            label_li = label_li + cur + ','
        }
        label_li = label_li.slice(0, -1)
        upload_photo(label_li)
    })
    $(document).on('submit', '#search-form', function (event) {
        event.preventDefault()
        remove_images()
        let query = $("#search-field").val()
        console.log(query)
        search_photos(query)
    })
})