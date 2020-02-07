var globalxml = '';
const initialBookings = [
     {
        layout: 'hotel',
        row: 10,
        number: 1,
        timestamp: new Date()
    },
	{
        layout: 'hotel',
        row: 12,
        number: 3,
        timestamp: new Date()
    },
];
function loadhotel1() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            globalxml = this.responseXML;
            populateLayout(globalxml);
            populateTable(globalxml);
        }
    };
    let bookings = readBookings();
    if(!bookings){
        writeBookings(initialBookings);
    }
    xhttp.open("GET", "design.xml", true);
    xhttp.send();
}

function populateLayout(xmlDoc) {
    let activelayout = localStorage.getItem('activelayout') === 'hotel' ? 'hotel':  'hotel1';
    $(`#${activelayout}`).toggleClass('hide');

   

    var hotel = xmlDoc.getElementById("hotelxml");
    document.getElementById("hotel").appendChild(hotel);
}

function populateTable(xmlDoc){
    var bookings = readBookings();
    let bookingarray = [];
    let totalcost = 0;
    let bookingcost = 0;
    let bookingshtml = bookings.map(b => {
        let price = $(`#${b.layout} row:nth-child(${b.row})`).attr('price');
        if(b.pending){
            bookingcost += parseInt(price);                        
        }else{
            totalcost += parseInt(price);            
        }
        let bookingClass = b.pending? 'pending':'booked';   
        $(`#${b.layout} row:nth-child(${b.row}) col:nth-child(${b.number})`).removeClass('empty');
        $(`#${b.layout} row:nth-child(${b.row}) col:nth-child(${b.number})`).removeClass('pending');
        $(`#${b.layout} row:nth-child(${b.row}) col:nth-child(${b.number})`).addClass(bookingClass);
        return (`<tr class="${bookingClass}"><td>${b.layout}</td><td>${b.row}</td><td>${b.number}</td><td>${price}</td><td>${formatDate(b.timestamp)}</td><td>${formatTime(b.timestamp)}</td></tr>`);
    });
    if(bookingcost === 0){
        $('#bookingbutton').attr('disabled',true);
    }else{
        $('#bookingbutton').attr('disabled',false);            
    }
    $('#bookingsbody').html(bookingshtml);
    $('#totalcost').html(totalcost);
    $('#bookingcost').html(bookingcost);
}

document.getElementById("togglebtn").addEventListener("click", function () {
    
    var element = document.getElementById("hotel");
    element.classList.toggle("hide");
    let activelayout = element.classList.value === 'hotel';
    localStorage.setItem('activelayout',activelayout);
    element = document.getElementById("hotel1");
    element.classList.toggle("hide");
});

document.getElementById("bookingbutton").addEventListener("click", function () {
    console.log('book');
    var bookings = readBookings();
    bookings = bookings.map(b => {
        if(b.pending){
            delete b.pending;
        }
        return b;
    })
    writeBookings(bookings);
    populateTable();
});

$('body').on('click','col.empty',function(e){
    findIndex(e,'book');
});

$('body').on('click','col.pending',function(e){
    findIndex(e,'cancel');
});

function findIndex(e,type) {
    $(e.target).toggleClass('pending empty')    
    let price = $(e.target).parent().attr('price');
    let parent = $(e.target).parent().parent();
    let number = $(e.target.parentNode.children).index($(e.target));
    let row = parent.children().index($(e.target).parent());
    let obj = {
        layout: parent[0].nodeName,
        row: parseInt(row) +1,
        number: parseInt(number) +1,
        timestamp: new Date(),
        pending : true,
    };
    let bookings = readBookings();
    if (type === 'book'){
        bookings.push(obj);
    }else{
        bookings = bookings.filter(b => 
            !(parseInt(b.row) === (parseInt(row) +1) && parseInt(b.number) === (parseInt(number) +1) && b.layout === parent[0].nodeName)
        );
    }
    writeBookings(bookings);
    populateTable();
}

function writeBookings(data = {}){
    localStorage.setItem('bookings',JSON.stringify(data));
}

function readBookings(){
    let data = localStorage.getItem('bookings');
    return JSON.parse(data);
}

function formatDate(date) {
    date = new Date(date);
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function formatTime(date) {
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}