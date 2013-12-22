$(document).ready(function(){
    $('#nav li').not('.active').hover(highlight);
    $('#user').click(ddown);
});
function highlight(){
    $(this).toggleClass('active');
}
function ddown(){
    $('.ddown-cont').slideToggle();
}