function remove_script_tag(str) {

  let str_old = '';
  let str_new = str;

  // remove <script>
  // it won't work if there is any space in <script> ex: < script>
  // check not nested in <script> ex: <script<script>>
  while (str_new !== str_old) {
    str_old = str_new;
    str_new = str_old.replace(/(<|&lt;)\/?script(>|&gt;)/ig, '');
  }

  return str_new;

}

function prevent_js_injection(req, res, next) {
  const query_str = JSON.stringify(req.query);
  req.query = JSON.parse(remove_script_tag(query_str));
  const body_str = JSON.stringify(req.body);
  req.body = JSON.parse(remove_script_tag(body_str));

  next();

}

module.exports = prevent_js_injection;
