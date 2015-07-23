---
layout: post
title:  "Parallel breadth-first aggregation algorithm"
author: "Masayoshi Hagiwara"
author-link: "http://blogs.msdn.com/b/masayh/"
#author-image: "{{ site.baseurl }}/images/MasayoshiHagiwara/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Hadoop HDInsight Big-Data Batch-Processing
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Parallel breadth-first aggregation algorithm
---

Executing business applications using batch processing is still a very important solution in enterprise information systems whether we adopt the cloud computing or not. Traditionally, we execute batch processing in inventory management, consolidated accounting by RDB using SQL statements. However, this RDB solution has two major limitations: One is the limitation of throughput. The second is high maintenance cost due to the complex SQL statements (and the mainframe operations running the batch programs).

In Japan, we have tried to alleviate these limitations to move from mainframes to “open” systems, but in vain. Main obstacle was less order of magnitude in parallelism in these open systems, as compared with the mainframes.

Recently, distributed systems and cloud computing services like Hadoop, Spark change this situation. In most cases, Hadoop and its ecosystem including real-time analytic databases aim at large scale data analysis and machine learning. But moreover, Hadoop and its ecosystem can also be applied for batch processing in business applications.

That said, if we use Hadoop or its cloud service like HDInsight to execute business applications, we will face the following typical problem, for example, in calculating net price of each product assembling the parts.

![Architecture]({{site.baseurl}}/images/2015-07-21-Parallel-breadth-first-aggregation-algorithm_images/image001.jpg)

In this figure, Assembly X-2 is built by Part G, Part H and Part I, and Part G is built by Part B, Part H is built by Part B and Part C, and Part I is built by Part D and Part E. In the same way, we can build the tree structure describing the dependency relationships of assemblies, intermediate parts, and final unit parts. By this tree structure, we can calculate how much each assembly costs, by traversing which part(s) build this assembly from the root to the leaves. This traversal is called depth-first traversal/search. But as depth-first search is known to be an inherently sequential algorithm, it does not fit closely with parallel processing on top of Hadoop.

## Overview of the Solution

Instead of depth-first search, here we consider breadth-first search to aggregate the price/cost of each data item.

Depth-first search can be parallelized in fact. But breadth-first search is better suited for MapReduce programming model in terms of divide and conquer design paradigm. Breadth-first search can be parallelized for each partitioned group of leaves in the same level of the tree on map side, then will be aggregated on reduce side as needed. This parallelism is associated with the trade-off between data transfer overhead with shuffling and parallelized search to improve throughput and latency. Even if the tree is so enormous, partitioning leaves in a suitable size will solve the scalability problem. Parallelized breadth-first search is one of examples that can move intra-operation parallelism to inter-operation parallelism using map and reduce. This is an important insight of this case study. If you implement parallelized depth-first search in map and reduce, you need to write a complicated algorithm inside the map and/or reduce. It is so-called assembly-language level development and is not recommended because of limited flexibility for various business scenarios. Moreover, breadth-first search is easy to work with almost equally partitioned group of data items. It can cope well with the problem of skewed data distribution, while the parallelized depth-first search is not always good at.

By using a queue Open, the BFS(Breadth-First-Search) pseudo code is:

```
BFS() {
	Closed = {};
	Open = start_node;
	while (Open ≠ empty) {
		current = pop(Open);
		if (current ∉  Closed) {
			Closed = Closed ⋃ current;
			foreach (node ∈ succs(current))
				if(node ∉  Closed)
					Open = Open ⋃ node;
		}
	}
}
```

However, this code is not scalable. Because Open (open list contains current front) and Closed (closed list contains visited nodes) become so enormous for large-scale applications that BFS cannot solve the problem due to the bottleneck of these variables. For example, the number of parts in an aircraft is at most 10<sup>6</sup>, and the number of order items at a large retail chain per quarter amounts to 10<sup>9</sup>.  Also, the traditional breadth-first search has drawbacks in terms of extra space required by the queue data structure. If a tree has multiple children and is a balanced tree, then the queue size would grow exponentially and could cause serious memory threats.

So we need to decompose data by partitioning the tree and to parallelize BFS with MapReduce. MapReduce has two functions: map(key, value) and reduce(key, value). Then, for graph models, we set key=node, value=vertex(vertices).

The pseudo code of BFS with MapReduce is:

```
void mapper(Position position, set usedMoves) {
	foreach((successor, move) ∈ successors(position))
		if(inverse(move) ∉ usedMoves)
			emit(successor, move);
}

void reducer(Position position, set<set> usedMoves) {
	moves = 0;
	foreach(move ∈ usedMoves)
		moves = moves ⋃ move;
		emit(position, moves);
}

main() {
	front = {(start_node, 0)};
	while (front ≠ 0) {
		intermediate = map(front, mapper());
		front = reduce(intermediate, reducer()); }
}
```

## Code Artifacts

This case study is based on the development of Asakusa framework, batch processing runtime on top of Hadoop and its development environments which were developed by Nautilus Technologies, Inc. ([http://www.nautilus-technologies.com/](http://www.nautilus-technologies.com/)) I was collaborating with Nautilus in the design phase of Asakusa framework. The code artifacts of Asakusa framework is [https://github.com/asakusafw/asakusafw](https://github.com/asakusafw/asakusafw)

Asakusa framework provides the operators such as master selection (MasterCheck) and join (MasterJoin). But it does not provide a parallelized search algorithm. This is because application developers can build parallelized breadth-first search algorithm by defining a business flow including master selection and join operators. Since Asakusa framework is applicable to batch processing of business applications, it is acceptable to omit the function of the traversal of a generic graph that parallelized depth-first search can handle better.

The example of aggregating the data items such as sales transaction is very easy and does not require search algorithms for a tree. But the following case is what we need a search tree.

Cost estimation of sales transactions: From the sales record, we can get a list of products per sales transaction. At the same time, from the date of sales transaction and inventory data, we can get cost about procurement of the products. Then we can aggregate the cost to estimate the cost of sales transactions. For instance, if exchange rate changes, we can estimate how it will change the cost and impact the earnings. In order to aggregate the cost,

```
for each sales transaction
	get the products (master selection)
	get the sales date (master selection)

for each product
	get a procurement transaction of the product from the date (master selection)
	get a cost of the product
	get the total cost
	get the total sales price
	get the total sales price - the total cost
```

## Opportunities for Reuse

In real world, it is almost impossible to calculate the net price/cost of products and services, for example, how much the net profit is by selling one product in a supermarket. Because its price contains the net price of product, its materials, and various operational cost of the facility like warehouses, shops, transportation, staff payroll, tax, interest and so on.

Under some assumptions we can calculate net cost and thus net profit by aggregating various data items by leveraging parallel distributed algorithms running on top of Hadoop and other distributed systems. This will open up a new type of business applications. To enable this, we will adopt efficient parallel algorithms. One such algorithm is breadth-first traversal/search of graph models.
