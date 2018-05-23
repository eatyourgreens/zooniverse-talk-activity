var comments = []
var subjects = {};

function renderComment(comment) {
  var subject = subjects[comment.focus_id];
  var image_locations = subject.locations.filter(function(location) {
    var type = Object.keys(location)[0];
    return type === 'image/jpeg' || type === 'image/png';
  });
  var image_location = image_locations[0];
  var image_url = image_location['image/jpeg'] || image_location['image/png'];
  var img = document.createElement('img');
  img.src = image_url;
  img.alt = comment.body;
  var caption = document.createElement('p');
  caption.appendChild(document.createTextNode(comment.body));
  var container = document.createElement('a');
  container.href = 'https://www.zooniverse.org/projects/' + comment.project_slug + '/talk/subjects/' + comment.focus_id;
  container.className = 'talk-image';
  container.appendChild(img);
  container.appendChild(caption);
  document.body.appendChild(container);
}

function loadSubjects(subject_ids) {
  var request = new XMLHttpRequest();
  request.open('GET', "https://www.zooniverse.org/api/subjects?http_cache=true&page_size=50&id=" + encodeURI(subject_ids.join(',')));
  request.setRequestHeader('Accept', 'application/vnd.api+json; version=1');
  request.setRequestHeader('Content-Type', 'application/json');
  request.send();
  request.onload = function (e) {
    response = JSON.parse( this.responseText ).subjects;
    response.forEach(function(subject) {
      subjects[subject.id] = subject;
    });
    comments.forEach(renderComment);
  }
}
(function loadTalkComments() {
  var request = new XMLHttpRequest();
  request.open('GET', "https://talk.zooniverse.org/comments?http_cache=true&page_size=50&sort=-created_at&focus_type=Subject");
  request.setRequestHeader('Accept', 'application/vnd.api+json; version=1');
  request.setRequestHeader('Content-Type', 'application/json');
  request.send();
  request.onload = function (e) {
    comments = JSON.parse( this.responseText ).comments;
    var subject_ids = comments.map(function(comment) {
      return comment.focus_id;
    })
    subject_ids = subject_ids.filter(function(subject_id, i) {
      return subject_ids.indexOf(subject_id) === i;
    });
    loadSubjects(subject_ids);
  }
})();