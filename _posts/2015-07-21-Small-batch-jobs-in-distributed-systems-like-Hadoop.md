---
layout: post
title:  "Small Batch Jobs in Distributed Systems like Hadoop"
author: "Masayoshi Hagiwara"
author-link: "http://blogs.msdn.com/b/masayh/"
#author-image: "{{ site.baseurl }}/images/MasayoshiHagiwara/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Hadoop HDInsight Big-Data Batch-Processing MapReduce
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Small Batch Jobs in Distributed Systems like Hadoop
---

Modern batch frameworks like [Hadoop](http://hadoop.apache.org/) and [Spark](http://spark.apache.org/) use distributed systems that are designed to manage relatively large batch jobs efficiently. This design decision is valid in most cases because most of the applications that these frameworks run are data analysis, ETL, or machine learning. Such frameworks are used to accelerate business batch applications by parallelizing the jobs.

A typical business batch application consists of many jobs which are mixture of large, medium and small jobs in general. And we found that the overall execution time of a business batch application are dominated by the execution of small jobs of the application. How we work small jobs efficiently by distributed systems like Hadoop is critical to scale business batch applications.

In this paper you learn how to write efficient small batch jobs using Hadoop's MapReduce framework.

## Overview of the Solution

Processing small files is an old problem in Hadoop. A small file for our purposes is one that is significantly smaller than the HDFS block size (default 64MB). There are two major problems:  first, HDFS is inefficient when it contains many files, and second, a large number of map tasks causes increased load on the cluster, which slows down job execution.

Every file, directory and block in HDFS is represented as a metadata object in the name node’s memory. Each occupies about 150 bytes. So a million files, each using a block, would use about 1 gigabyte of memory. Hence, the name node process runs into the danger of becoming increasingly slow due to excessive garbage collection (GC) until finally throwing an Out of Memory (OOM) exception. Certainly a billion files is not feasible. In addition, HDFS is not designed to efficiently access small files: it is primarily designed for streaming access to large files. Reading through small files normally involves a large number of seeks and large number of shifts from data node to data node to retrieve each small file, an inefficient data access pattern.

Map tasks usually process a block of input at a time (using the default `FileInputFormat`). If the files are very small and there are a lot of them, then each map task processes very little input, and there are a lot more map tasks, each of which imposes extra bookkeeping overhead. Compare a 1GB file broken into 16 64MB blocks, and 10,000 or so 100KB files. The 10,000 files use one map each, and the job time can be tens or hundreds of times slower than the equivalent one with a single input file.

However, there are several options for dealing with small files on Hadoop:

1. Change your “feeder” software so it doesn’t produce small files (or perhaps files at all). In other words, if small files are the problem, change your upstream code to stop generating them
2. Run an offline aggregation process to aggregate your small files into larger ones, and re-uploads the aggregated files ready for processing
3. Add an additional Hadoop step to the start of your job flow that aggregates the small files
4. Use something other than Hadoop to process your data. You could create a scheme for parallelization on your own.

Similar to the inefficiencies of processing of small files, Hadoop is also inefficient at running small jobs. If there are a small number of anomalies or outliers in a business batch application, we need to execute a small job to handle the exceptional data specially. Since business applications often have a high number of anomalies (resulting from dirty data), they inevitably have many small jobs; these small jobs are mixed with normal size jobs in the stages of the batch processing. Because these jobs contain exception or outlier data, we cannot aggregate small jobs in the same manner as small files. This is why we need to create a scheme for parallelization on our own (item 4 approach).

Initialization cost is the primary cause of inefficiency in executing small jobs. Hadoop or other cluster applications can only start after all the distributed resources are ready.  YARN is Hadoop’s resource manager; the architecture of YARN is shown in Figure 1 below.

In Figure 1, you can see that there are many communication procedures between the cluster components. After the cluster components are initialized, we can deploy our application programs to worker processes. If this initialization cost is worth paying, the distributed systems will be efficient for your solution. That is, there is the tradeoff between the performance gain such as high throughput or low latency, and the overhead involved with the distributed systems. In some scenarios, you can execute your application more efficiently on local multi-core system than in a distributed system.

![Architecture]({{site.baseurl}}/images/2015-07-21-Recursive-Descent-Formula-Parsing-in-NET_images/image001.png)

Figure 1: [YARN](http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html) architecture

### Asakusa Framework

The Asakusa Framework provides solutions to these challenges with small jobs and files. The Asakusa Framework is an open-source mission-critical batch processing framework that supports multi-processing, restart, data transfer and development environments including DSLs. The Framework is in wide use in Japan and documentation can be found here:  [http://asakusafw.s3.amazonaws.com/documents/latest/release/ja/html/index.html](http://asakusafw.s3.amazonaws.com/documents/latest/release/ja/html/index.html).

The Asakusa Framework executes business batch applications to parallelize their jobs on top of Hadoop. To accelerate small jobs, the Asakusa Framework has a local in-process executor. To enable this function, use the a configuration file `asakusa-resources.xml.`

```
<name>com.asakusafw.inprocess.limit</name>  
<value>5242880</value>
```

This example shows up to 5MB input data of a small job to run on local in-process executor. This local executor is run on the client process. And it may degrade the performance when input data size is set to more than 10MB.

Internally, Asakusa framework reads this setting and installs the local in-process executor. Then it executes the jobs in a distributed system or in-process depending on the size of jobs.

Now, in order to evaluate the performance of the local in-process executor, we will clarify the overhead of small jobs at first in the following example:

We assume that a 10GB MapReduce job takes 240 seconds and 10MB MapReduce job takes 30 seconds. And let’s assume that there are 100 jobs and 90% of them are small jobs in a business application. Then the total execution time will be:

```
Total execution time = 240*10+30*90 = 2,400+2,700 = 5,100s.
```

This example shows that the execution time of the small jobs is longer than the execution time of other normal jobs. Thus, it is necessary to improve the execution time of the small jobs to substantially improve the overall execution in the business batch application.

We also evaluated the effect of small jobs in typical real-world business batch applications. Table 2 shows the comparison of execution time between Hadoop MapReduce only and Hadoop/MapReduce with local in-process executor for small jobs.

<table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0
 style='border-collapse:collapse;border:none'>
 <tr>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Batch applications</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>MapReduce</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>MapReduce+ Local in-process</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Total number of jobs in all</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Total number of small jobs</p>
  </td>
 </tr>
 <tr>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Tree-structure aggregation</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>50 min</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>15 min</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>184</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>180</p>
  </td>
 </tr>
 <tr>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Data normalization</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>8 min</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>3 min</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>20</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>17</p>
  </td>
 </tr>
 <tr>
  <td width=249 valign=top style='width:93.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>BOM cost calculation</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>65 min</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>52 min</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>60</p>
  </td>
  <td width=249 valign=top style='width:93.5pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>10</p>
  </td>
 </tr>
</table>

Table 2: Comparison of execution time between MapReduce only and MapReduce with local in-process executor for small jobs (by Nautilus Technologies)

Depending on the ratio of small jobs in a batch application, the effect of local in-process executor varies. Among three kinds of batch applications in Table 2, the tree-structure aggregation application can take advantage of the effect because it has a large ratio of small jobs.

It is evaluated that the local in-process executor can execute jobs 5-10x faster than Hadoop for 10MB input data. And as many kind of business batch applications have more than 50% ratio of small jobs, we can say that local in-process executor is very effective.

## Code Artifacts

This case study is based on the development of Asakusa framework, batch processing runtime on top of Hadoop and its development environments which were developed by Nautilus Technologies, Inc. ([http://www.nautilus-technologies.com/](http://www.nautilus-technologies.com/)) Code artifacts of Asakusa framework are located at [https://github.com/asakusafw/asakusafw](https://github.com/asakusafw/asakusafw).

## Opportunities for Reuse

Because this is a common problem for business data pipelines, there are a large number of opportunities for reuse.
