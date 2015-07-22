# MapReduce Code Generation Using a DAG Model: A TED Case Study

Masayoshi Hagiwara, 28th May 2015

# Audience:

External

# Tags

Hadoop, HDInsight, Big Data, Batch Processing, Directed Acyclic Graph, Domain Specific Language

# The Problem

Business batch applications can make use of modern batch frameworks such as Hadoop and Spark to parallelize their jobs. However, the MapReduce programming model of Hadoop requires us to develop an application at such a low level that maintaining the resulting code can become very expensive. This is because there is a big gap in the level of abstraction between business process definitions and their implementation in programming models like MapReduce. A business process has a lot of exceptional procedures, error handling, etc. When we write MapReduce programs that handle these business exceptions, the programs soon become too complicated to manage. Typical business applications have hundreds or thousands of business exceptions, leading to hundreds or thousands of stages in the MapReduce programs that model them. In addition, since business requirements tend to change frequently, the code artifacts involved are required to change easily and inexpensively.

SQL on Hadoop or Hive does not help to solve this problem, because the SQL statements describing a business application having a lot of exceptions become so complicated that they are just as hard to develop and maintain as custom MapReduce code.

# Overview of the Solution

To overcome the problem, the Asakusa Framework was developed.  The Asakusa Framework is a domain specific language (DSL) for business applications, coupled with the “enterprise level” quality of runtime support. The Asakusa Framework is an open-source mission-critical batch processing framework that supports multi-processing, restart, data transfer and development environments including DSLs. The Framework is in wide use in Japan and documentation can be found here:  [http://asakusafw.s3.amazonaws.com/documents/latest/release/ja/html/index.html](http://asakusafw.s3.amazonaws.com/documents/latest/release/ja/html/index.html).

The DSL will compile business applications described at a business level of abstraction into a directed acyclic graph (DAG) as an intermediate language, then generates the MapReduce programs based on the resulting DAG. The DAG model is adopted because it defines the partial order of stages of MapReduce programs including concurrent processes. For the same reason, several open source projects such as Apache [Spark](http://spark.apache.org/), [Storm](http://storm.apache.org/) and [Tez](http://tez.apache.org/) have adopted the DAG model, originating with Dryad, from Microsoft Research, available here: [http://research.microsoft.com/en-us/projects/Dryad](http://research.microsoft.com/en-us/projects/Dryad).

![](MapReduce%20code%20generation%20using%20DAG%20model%20-%20a%20TED%20Case%20Study_files/image001.jpg)

Figure 1: a DAG model and its topological sort

One of the characteristics of the DAG model is its topological sort. Figure 1 shows how topological sort works in a particular DAG model. In Figure 1, a circle means a process or a node, and an arrow means data flow from one process to another process. For example, process C has two incoming arrows. Process C can start only after data from both process A and process B are available. This means if process C receives data from process A only, process C has to wait for data from B. This shows an implicit synchronization at process C.

Now let’s consider that one business application is formed by the processes from A to G as shown in Figure 1 and process G receives data from an external data source at the start.

Process G sends data to process A, then process A sends data to both process B and process C. Process B can immediately start when it receives data from process A. But process C can start after Process B starts because it has to wait for data from process B. In the same way, process F starts after process C starts. Process E starts after process F. And process D starts after process E starts. The DAG model in Figure 1 shows this dependency of processes of an application through data flow. As the result, the data flow between processes of this business application decides the order of executing the processes. This order is topological sort of the DAG model. Topological sort in Figure 1 decides only one order. In general, there are several orders that topological sort decides because a DAG model defines partial order of processes (concurrent processes).

In this case study, we developed useful operators of data manipulation in the area of business applications in Table 1\.

These built-in operators provided by our DSL were defined by practical usage in business application domains, and developers can customize their own operators for their purpose based on these built-in operators using a DSL. Built-in operators can cover many scenarios because they are very generic. If you need to define operators of a data flow application on top of Hadoop or Spark, the definition of these built-in operators can be used as a reference.

<table class=MsoTable15Plain1 border=1 cellspacing=0 cellpadding=0
 style='border-collapse:collapse;border:none'>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Operator</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border:solid #BFBFBF 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Function</b></p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border:solid #BFBFBF 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Layout constraint</b></p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Branch</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Choose one output target depending on the condition</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>confluent</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Combine several inputs into one output</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Update</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Update the value of a record</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Convert</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Update the type of a record and create a new type</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>extend</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Add a new property to the type and create a new type</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>project</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Remove the existing property from the type and create a new type</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>restructure</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Move the values of common properties from one type to another type</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Extract</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Read the values of a record and put them into several records</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>MasterCheck</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Look for the same key of a record and branch if found or not</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce*</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>MasterJoin</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Look for the same key of a record and join it with found records</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce*</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>MasterBranch</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Look for the same key of a record and branch depending on both the
  record and found records</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce*</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>MasterJoinUpdate</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Look for the same key of a record and update either record(s)
  depending on both the record and found records</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce*</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>CoGroup</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Group several input records with the same key </p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Split</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Extract records from a combined record</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Summarize</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Group records with the same key and summarize each group</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Fold</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Group records with the same key and fold records in a group</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>GroupSort</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Group records with the same key and sort records in a group</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Reduce</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>checkpoint</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Set a retry point (not related with transaction processing)</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
 <tr>
  <td width=185 valign=top style='width:69.55pt;border:solid #BFBFBF 1.0pt;
  border-top:none;background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><b>Logging</b></p>
  </td>
  <td width=872 valign=top style='width:327.1pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Output a log at this point of a flow</p>
  </td>
  <td width=189 valign=top style='width:70.85pt;border-top:none;border-left:
  none;border-bottom:solid #BFBFBF 1.0pt;border-right:solid #BFBFBF 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Map</p>
  </td>
 </tr>
</table>

Table 1:  Layout constraint on map/reduce side of operators

Reduce* is typically executed as part of the reduce phase, but may be executed in the map phase due to optimization.

The Asakusa Framework provides 3 types of DSLs: batch, flow and operator. These DSLs are following Java syntax and not graphical.

``
@Batch(name = "example.summarizeSales")
public class SummarizeBatch extends BatchDescription {

    @Override
    protected void describe() {
        run(CategorySummaryJob.class).soon();
    }
}
``

To execute a batch job, we sometimes need to import data from sources or export to destinations other than HDFS; this data transfer should be part of the job. To do this, the Asakusa Framework provides a utility to manage batch jobs. It offers complementary assistance for other OSS tools such as Sqoop, Ozzie and Pig.

- Flow DSL describes the business flow of a batch job. For instance, the job CategorySummaryJob.class in the batch DSL above is described below. A flow is defined by the sequence of built-in and/or user customized operators (operators.xxxx) that are also defined by the third operator DSL.

''
 @Override
    protected void describe() {
        CoreOperatorFactory core = new CoreOperatorFactory();
        CategorySummaryOperatorFactory operators = new CategorySummaryOperatorFactory();

        // Check the store id of the storeInfo
        CheckStore checkStore = operators.checkStore(storeInfo, salesDetail);

        // Add the product info to the sales transaction
        JoinItemInfo joinItemInfo = operators.joinItemInfo(itemInfo, checkStore.found);

        // Summarize sales by category
        SummarizeByCategory summarize = operators.summarizeByCategory(joinItemInfo.joined);

        // Output the summary
        categorySummary.add(summarize.out);

        // Error if sales transaction with an unknown store id
        SetErrorMessage unknownStore = operators.setErrorMessage(
                core.restructure(checkStore.missed, ErrorRecord.class),
                "Unknown store");
        errorRecord.add(unknownStore.out);

        // Error if the product info is not available
        SetErrorMessage unknownItem = operators.setErrorMessage(
                core.restructure(joinItemInfo.missed, ErrorRecord.class),
                "Unknown product");
        errorRecord.add(unknownItem.out);
    }
''

- Operator DSL describes operators which are used in flow DSL.

``
public abstract class CategorySummaryOperator {

    /**
     * Check the store master database to find the store id of the sales transaction
     * @param info store master database
     * @param sales sales transaction
     * @return if available {@code true}
     */
    @MasterCheck
    public abstract boolean checkStore(
            @Key(group = "store_code") StoreInfo info,
            @Key(group = "store_code") SalesDetail sales);

    /**
     * Join the product master with the sales transaction
     * @param info product master database
     * @param sales sales transaction
     * @return joined result
     * @see #selectAvailableItem(List, SalesDetail)
     */
    @MasterJoin(selection = "selectAvailableItem")
    public abstract JoinedSalesInfo joinItemInfo(ItemInfo info, SalesDetail sales);

}
``

In addition, the Asakusa Framework provides dmdl DSL to define data. For instance,

``
"sales transaction"
@directio.csv(
    has_header = TRUE,
    datetime = "yyyy-MM-dd HH:mm:ss"
)
sales_detail = {

    "sales date"
    @directio.csv.field(name = "date")
    sales_date_time : DATETIME;

    "store id"
    @directio.csv.field(name = "store id")
    store_code : TEXT;

    "product code"
    @directio.csv.field(name = "product code")
    item_code : TEXT;

    "quantity"
    @directio.csv.field(name = "quantity")
    amount : INT;

    "sales price"
    @directio.csv.field(name = "sales price")
    unit_selling_price : INT;

    "sales total"
    @directio.csv.field(name = "sales total")
    selling_price : INT;

    "file name"
    @directio.csv.file_name
    file_name : TEXT;
};

"store master"
@directio.csv(has_header = TRUE)
store_info = {

    "store id"
    @directio.csv.field(name = "store id")
    store_code : TEXT;

    "store name "
    @directio.csv.field(name = "name")
    store_name : TEXT;
};

"product master"
@directio.csv(
    has_header = TRUE,
    date = "yyyy-MM-dd"
)
item_info = {

    "product code"
    @directio.csv.field(name = "product code")
    item_code : TEXT;

    "product name"
    @directio.csv.field(name = "product name")
    item_name : TEXT;

    "product department code"
    @directio.csv.field(name = "department code")
    department_code : TEXT;

    "product department name"
    @directio.csv.field(name = "department name")
    department_name : TEXT;

    "product category code"
    @directio.csv.field(name = "category code")
    category_code : TEXT;

    "product category name"
    @directio.csv.field(name = "category name")
    category_name : TEXT;

    "product unit price"
    @directio.csv.field(name = "unit price")
    unit_selling_price : INT;

    "registered date"
    @directio.csv.field(name = "registered date")
    registered_date : DATE;

    "applicable date"
    @directio.csv.field(name = "applicable date")
    begin_date : DATE;

    "invalidated date"
    @directio.csv.field(name = "invalidated date")
    end_date : DATE;	
};
``

Built-in and customized operators executed at the processes of a DAG model put a constraint on generating MapReduce programs via this DAG model, because some operators can be executed in the map phase, but others cannot. For example, operators like CoGroup, Summarize, Fold, and GroupSort need to be executed in the reduce phase.

The DSL compiler analyzes the operators used in flow DSL and generates MapReduce programs via the DAG model following this layout constraint. One example is shown in Figure 2.

This example shows a particular retail application which executes the following procedure:

(1) check the validity of storeInfo(store id) in the salesDetail by @MasterCheck operator.

(2) if the storeInfo is invalid, then outputs an error.

(3) join salesDetail and itemInfo by @MasterJoin operator.

(4) if the itemInfo is not available, then outputs an error.

(5) summarize salesDetail by category using @Summarize operator.

Then this procedure is transformed into stages which run Mapper(s) and/or Reducer(s). Each Mapper or Reducer executes an operator given according to the layout constraint of Table 1.

Internally, flow DSL analyzes a flow definition to generate the FlowGraph (Figure 2 above). The Asakusa compiler (called [Ashigel](https://github.com/asakusafw/asakusafw/tree/master/dsl-project/ashigel-compiler/src/main/java/com/asakusafw/compiler)) then transforms this FlowGraph to the StageGraph (Figure 2 below) which consists of stages that include Mapper(s) and/or Reducer(s). Map and reduce classes are generated by the compiler, so application developers do not have to write map and reduce classes.

![](MapReduce%20code%20generation%20using%20DAG%20model%20-%20a%20TED%20Case%20Study_files/image002.jpg)

![](MapReduce%20code%20generation%20using%20DAG%20model%20-%20a%20TED%20Case%20Study_files/image003.jpg)Figure 2: MapReduce code generation of a retail application - Data operations of the data flow (above) and the result of MapReduce layout analysis (below). Visualized by [Graphviz](http://graphviz.org/).

# Code Artifacts

This case study is based on the development of the Asakusa Framework, batch processing runtime on top of Hadoop and its development environments which were developed by Nautilus Technologies, Inc. ([http://www.nautilus-technologies.com/](http://www.nautilus-technologies.com/)).

The Asakusa Framework was designed in collaboration with Nautilus. The code for the Asakusa framework can be found on github: [https://github.com/asakusafw/asakusafw](https://github.com/asakusafw/asakusafw).

# Opportunities for Reuse

Since a DAG model supports a generalized form of concurrent applications based on data flow programming, insight drawn from this case study will give many opportunities for reuse. That is, with a layout analysis for a particular constrained programming model like MapReduce, the DAG model as an intermediate language will improve concurrency using the partial order of concurrent processes. Consequently, developers of the Asakusa Framework, Spark or Tez will automatically gain the advantage of the DAG model.