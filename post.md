# Introduction

> NOTE: avoid "one" instead of "we"/"I", avoid passive voice, avoid verbiage.
> Be concise, precise and, wherever possible, informal!

Social networks like Facebook and Twitter are created with communities in mind.
But there are also passive, implict communities that are defined by their
members’ interactions with the service (such as Netflix and Spotify)

Defining such relationships and and analysing the communities the connections
imply allows us to learn about both the community and the subject. For
instance, users of a music streaming service can be grouped together based on
the kind of music they like. These groups could be used to investigate shifting
trends, and the emergence and decline of subcultures. 

These insights are not only culturally significant, but also valuable from a
business perspective. Streaming services spend millions of dollars each year to
acquire content. Can we build tools that help them to study their userbase and
optimize their catalogue?

In this post we are going to look at an interactive visualization that clusters
movies together based on user ratings. This visualization will give us a
glimpse into a community of cinephiles.

# MUBI

MUBI is a streaming service similar to Netflix, but with a focus on arthouse,
international and cult movies. Its 8 million users have collectively rated and
reviewed thousands of movies present in its database. Given this dataset, how
can we visualize the relationship between these users and the movies that they
have rated? Let's take a look at a technique called t-SNE that can help us solve
this problem.

# T-SNE

> TODO: is there a less wordy phrase than "Data visualization designers" (which
> I've never heard!)

Data visualization designers use a number of techniques and tricks to show the
relationship between items in a dataset. Of course the location in the 2D
visualization is an option, but scalar values such as rating or count can be
shown by the size of the point, and categorical variables can be shown using
colored labels.

(This is where the table goes)

> NOTE: these shapes all look the same size to me!!! And is it linear size or
> area?!

> NOTE: don't say "on the right", as it might not be, depending on screen size?

This visualization shows a dataset with four dimensions. Each of these
dimensions is visualized in a different way, using size, symbols and location. 

What if we have a dataset with thousands of dimensions? The designer would
start run out of ways to visualize each dimensions and the resulting
visualization would probably be incomprehensible to the user.

> TODO: link to TSNE paper

This is where t-SNE can help us. t-SNE (t-distributed stochastic neighbor
embedding) is a machine learning algorithm developed by Geoffrey Hinton and
Laurens van der Maaten which reduces the dimensionality of a dataset. It is
especially good at reducing very high dimensional data to two or three, which
makes it much easier to visualize using simple techniques such as scatterplots.

> TODO: citation needed for "1901"

Dimensionality reduction is an old technique. Principal component analysis, for
example, has been used to attak this problem since 1901. But t-SNE does
something that may other schemes do not: it maintains as much global and local
structure as it can. This is done by explicitly trying to maintain the distance
between points from before and after the algorithm has been applied. Its
reduction is therefore ideal for both clustering and visualization. 

# Process

For the purpose of this blogpost we selected a subset of users who had rated at
least 20 movies. An adjacency matrix can be constructed for this subset of
users, where each row is a user and each column is a user’s rating for a
particular movie. 

This matrix can be transposed to yield a matrix where each row represents a
movie, and each column represents the various ratings for that movie. This is
the matrix that will serve as our t-SNE’s input. 

Our t-SNE will reduce the number of dimensions to just two: which we will use
as x-y coordinates for an interactive scatterplot.

# The Visualization

Without further ado, here is what our visualization looks like.

Each movie in the visualization is represented as square and the color of the
square represents the movie's genre. The position of each square is determined
by the t-SNE algorithm which only takes movie ratings by users as an input; the
algorithm is agnostic to the metadata of the movie itself such as genre,
director and year of release.

You can zoom into the visualization to get a more granular view of the clusters
and hovering over a movie will give you more information about the movie (but
you'll get a chance for a deeper dive in the sandbox section)

# Guided Tour

In this section we’ll give you a guided tour through some interesting trends
that we can observe in our visualization. Scroll along to trigger zoom
interactions that will lead you to interesting parts of the visualization!

There are some genres in the visualization that show strong clustering.
Clusters of movies of the same genre or same country of origin usually
indicates a subset of users affinity towards that particular type of movie.

Since this is a dataset of cinephiles from all over the world, it is reasonable
to expect that one could observe clusters of movies from different countries.
Indeed,we observe many such clusters from countries with strong cinematic
traditions such as Italy, Iran, India, Turkey and Japan.

Sometimes clusters form around cinematic time periods. One such cluster of
short black-and-white movies from the 1900s in quite apparent

It is observed that as we go from the left to the right the number of reviews
of a movie increases; As a consequence, movies ingrained in pop culture stand
out by themselves, far away from the crowd. Similarly filmographies of popular
directors, denoted by a web of lines in the visualization, such as Quentin
Tarantino or Stanley Kubrick tend to reside towards the right side of the
visualization.

# Sandbox

Time to get your hands dirty in the sandbox! You can play around with different
settings to turn different genres on/off or search for your favorite movie. You
can also click a movie to view some more information about it


# Footer

(There will be a footer here, with credits and perhaps a description of what
Fast Forward does. I can also put in any marketing material that you would
like)
