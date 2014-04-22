"use strict"

var tape = require("tape")
var graphToPolyline = require("../pg2pl.js")

tape("planar-graph-to-polyline", function(t) {

  function canonicalizeCycle(cycle) {
    var lo = 0
    for(var i=0; i<cycle.length; ++i) {
      for(var j=0; j<cycle.length; ++j) {
        var d = cycle[(i+j)%cycle.length] - cycle[(lo+j)%cycle.length]
        if(d < 0) {
          lo = i
        }
        if(d) {
          break
        }
      }
    }
    return cycle.slice(lo).concat(cycle.slice(0, lo))
  }

  function canonicalizeLoops(loops) {
    var cloops = loops.map(canonicalizeCycle)
    cloops.sort(function(a,b) {
      var d = a.length - b.length
      if(d) {
        return d
      }
      for(var i=0; i<a.length; ++i) {
        var d = a[i] - b[i]
        if(d) {
          return d
        }
      }
      return d
    })
    return cloops
  }

  function testGraph(edges, positions, expectedResult) {
    var polyline = graphToPolyline(edges, positions).map(canonicalizeLoops)
    var expected = expectedResult.map(canonicalizeLoops)
    polyline.sort()
    expected.sort()
    t.same(polyline, expected)
  }

  testGraph(
    [
      [0,1],
      [1,2],
      [2,3],
      [3,0],
      [3,4],
      [4,5],
      [5,6],
      [6,3]
    ],
    [
      [-1,0],
      [-1,1],
      [0,1],
      [0,0],
      [1,0],
      [1,-1],
      [0,-1]
    ],
    [
      [[0,1,2,3]],
      [[3,4,5,6]]
    ])

  function earring(n, theta) {
    var ringEdges = []
    var ringVertices = [ [0,0] ]
    for(var nn=0; nn<n; ++nn) {
      var base = ringVertices.length-1
      ringEdges.push([0,ringVertices.length])
      var ntheta = theta + n-nn
      for(var i=1; i<ntheta; ++i) {
        var x = 2.0 * Math.PI * i / ntheta
        var c = 1 - Math.cos(x)
        var s = Math.sin(x)
        var r = 1.0 / (nn+1)
        ringVertices.push([r*c, r*s])
        if(i === ntheta-1) {
          break
        }
        ringEdges.push([i+base,((i+1)%ntheta)+base])
      }
      ringEdges.push([ringVertices.length-1, 0])
    }
    console.log(ringEdges, ringVertices)
    var expected = []
    testGraph(ringEdges, ringVertices, expected)
  }

  for(var i=2; i<3; ++i) {
    earring(i, 6)
  }

  function concentric(n, theta) {
    var edges = []
    var vertices = []
    for(var nn=0; nn<n; ++nn) {
      var r = 1.0 / (nn + 1.0)
      var base = vertices.length
      for(var i=0; i<theta; ++i) {
        var x = 2.0 * Math.PI * i / theta
        var c = Math.cos(x)
        var s = Math.sin(x)
        edges.push([base+i, base+((i+1)%theta)])
        vertices.push([r*c, r*s])
      }
    }
    var expected = []
    console.log(edges, vertices)
    testGraph(edges, vertices, expected)
  }

  concentric(2, 10)

  t.end()
})