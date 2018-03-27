function merge(obj1, obj2) {
  var res = obj1.clone();
  for (var p of obj2) {
    res[p] = obj2[p];
  }
  return res;
}