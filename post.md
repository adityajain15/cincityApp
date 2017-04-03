#Introduction

As the internet becomes ubiquitous we are beginning to see the fruition of something that has its humble beginnings as USENET in the 80s; people from all walks of life are breaking barriers of the physical world and coming together on the internet to form large communities based on the ideas that resonate with them

While some of these communities are explicitly created for social interaction between members (such as Facebook and Twitter), we also see the emergence of passive communities that arise due to implicit relationships between its members which are defined by the members’ interactions with the service (such as Netflix and Spotify) 

Defining such relationships enables us to gain cultural insight into the community and the subject that it is centered about. For instance, users of a music streaming service can be grouped together based on the kind of music they like. The behavior of such a group could be used to document shifting trends of the musical genre they’re interested in, and to note the emergence and decline of subcultures. 

These insights are not only culturally significant, but also valuable from a business perspective. Movie/music streaming companies spend millions of dollars each year to acquire content. Can we build tools that help them to study their userbase and optimize their catalogue for operational costs?

#The Dataset

MUBI is an online service that integrates a subscription video-on-demand service with a massive database. The service has a truly diverse selection of content from underground cult classics to Tarantino blockbusters that attracts cinephiles from all over the world. Its 8 million users have collectively rated and reviewed thousands of movies present in its database. 


In this blogpost we decided visualize this eclectic community of cinephiles. We wanted to build a visualization that would help us learn about the aesthetic taste of individuals behind this community, and reveal smaller cliques that are biased in favor of certain category of movies 


But before we could build such a visualization we faced a challenge—How does one visually represent the relationship between thousands of users and the thousands of movies that they have rated? Lets take a look at a technique called t-SNE that can help us solve this problem.

#Introduction to t-SNEs

Data-Visualization designers use a number of techniques and tricks to visualize the difference between two datums in a dataset. Datum can be sized as larger/smaller geometrical shapes depending on a quantifiable dimension, and can be assigned a color from a set of colors to signify a label.

(This is where the table goes)

For example, consider the graphic on the right based on the above data which has 4 dimensions. Each of these 4 dimensions are visualized in different ways by using size, symbols and coordinates. What if we have a thousand dimensions that need to be visualized? Not only would a designer start running out of ways to visualize dimensions, the resulting visualization would probably be cognitively taxing to say the least.
This is where a t-SNE can help us. t-SNE (t-distributed stochastic neighbor embedding) is a machine learning algorithm developed by Geoffrey Hinton and Laurens van der Maaten which helps one to reduce the dimensionality of one’s data. It is popularly used to reduce high dimensionality data to a fewer number of dimensions, usually two or three, that enables one to draw scatterplots in which similar datum are placed in close proximity. 


This sort of dimensional reduction has been around for quite a while. One particularly popular method, PCA, has solved this sort of problem since 1901. However, t-SNE does something that may other schemes do not: it keeps maintains as much global and local structure as it can. As a result, the dimensional reduction is ideal for both clustering and visualization. This is done by explicitly trying to maintain the distance between points from before and after the algorithm has been applied.

#Process
For the purpose of this blogpost we selected a subset of users who had rated at least 20 movies. An adjacency matrix can be constructed for this subset of users, where each row is a user and each column is a user’s rating for a particular movie. 

This matrix can be transposed to yield a matrix where each row represents a movie, and each column represents the various ratings for that movie. This is the matrix that will serve as our t-SNE’s input. 

Our t-SNE will reduce the number of dimensions to just two: which we will use as x-y coordinates for an interactive scatterplot.

#Guided Tour

In this section we’ll give you a guided tour through some interesting trends that we can observe in our visualization. Somethings to keep in mind—our t-SNE only accepts movie ratings as an input. It is agnostic to meta data such genre and country of origin.

There are some genres in the visualization that show strong clustering. Clusters of movies of the same genre or same country of origin usually indicates a subset of users affinity towards that particular type of movie.

Since this is a dataset of cinephiles from all over the world, it is reasonable to expect that one could observe clusters of movies from different countries. Indeed,we observe many such clusters from countries with strong cinematic traditions such as Italy, Iran, India, Turkey and Japan.

Sometimes clusters form around cinematic time periods. One such cluster of short black-and-white movies from the 1900s in quite apparent

It is observed that as we go from the left to the right the number of reviews of a movie increases; As a consequence, movies ingrained in pop culture stand out by themselves far away from the crowd. 


#Footer
(There will be a footer here, with credits and perhaps a description of what Fast Forward does. I can also put in any marketing material that you would like)

