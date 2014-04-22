"use strict"

module.exports = planarGraphToPolyline

var e2a = require("edges-to-adjacency-list")
var planarDual = require("planar-dual")
var orient = require("robust-orientation")
var preprocessPolygon = require("point-in-big-polygon")

function planarGraphToPolyline(edges, positions) {

  var numVertices = positions.length
  var numEdges = edges.length

  //Calculate adjacency list, check manifold
  var adj = e2a(edges, positions.length)
  for(var i=0; i<numVertices; ++i) {
    if(adj[i].length % 2 === 1) {
      throw new Error("planar-graph-to-polyline: graph must be manifold")
    }
  }

  //Get faces
  var faces = planarDual(edges, positions)

  //Check orientation of a face
  function ccw(c) {
    var n = c.length
    if(n < 2) {
      return false
    }
    var y = 0
    for(var j=0; j<n; ++j) {
      var idx = c[j]
      var d = positions[idx][0] - positions[c[y]][0]
      if(d < 0) {
        y = j
      } else if(d === 0) {
        if(positions[idx][1] < positions[c[y]][1]) {
          y = j
        }
      }
    }
    var x = (y + n - 1) % n
    var z = (y + 1) % n
    return orient(positions[c[x]], positions[c[y]], positions[c[z]]) > 0
  }

  console.log(faces)

  //Extract all clockwise faces
  faces = faces.filter(ccw)

  //Detect which loops are contained in one another
  var numFaces = faces.length
  var containment = new Array(numFaces)
  for(var i=0; i<numFaces; ++i) {
    var row = new Array(numFaces)
    containment[i] = row
    var loopVertices = faces[i].map(function(v) {
      return positions[v]
    })
    var pmc = preprocessPolygon([loopVertices])
    for(var j=0; j<numFaces; ++j) {
      if(i === j) {
        row[j] = 1
        continue
      }
      row[j] = 0
      var c = faces[j]
      var n = c.length
      for(var k=0; k<n; ++k) {
        var d = pmc(positions[c[k]])
        if(d !== 0) {
          row[j] = (d > 0) ? 1 : 0
          break
        }
      }
    }
  }

  console.log(faces)
  console.log(containment)

  return []
}