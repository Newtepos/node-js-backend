const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInputObjectType, GraphQLID, GraphQLList, GraphQLInt } = require('graphql');


const UserInputType = new GraphQLInputObjectType({
    name: 'UserInput',
    fields: {
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        password: { type: GraphQLString }
    }
});

const LoginType = new GraphQLObjectType({
    name: 'LoginType',
    fields: () => ({
        userId: { type: GraphQLID },
        token: { type: GraphQLString }
    })
});

const PostInputType = new GraphQLInputObjectType({
    name: 'PostInput',
    fields: () => ({
        title: { type: new GraphQLNonNull(GraphQLString) },
        imageUrl: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
    })
});

const createPostType = new GraphQLObjectType({
    name: 'createPostType',
    fields: () => ({
        message: { type: GraphQLString },
        post: { type: PostType },
        creator: { type: new GraphQLObjectType({
            name: 'creator',
            fields: () => ({
                _id: { type: GraphQLID },
                name: { type: GraphQLString }
            })
        })}
    })
});

const getPostsType = new GraphQLObjectType({
    name: 'getPostsType',
    fields: () => ({
        message: { type: GraphQLString },
        posts: { type: new GraphQLList(PostType) },
        totalItems: { type: GraphQLInt }
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        _id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        imageUrl: { type: GraphQLString },
        creator: { type: UserType },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        password: { type: GraphQLString },
        status: { type: GraphQLString },
        posts: { type: new GraphQLList(PostType) }
    })
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
            login: {
                type: LoginType,
                args: {
                    email: { type: new GraphQLNonNull(GraphQLString) },
                    password: { type: new GraphQLNonNull(GraphQLString) }
                }
            },
            posts: {
                type: getPostsType,
                args: {
                    page: { type: GraphQLInt }
                }
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'RootMutation',
        fields: {
            createUser: {
                type: UserType,
                args: {
                    userInput: { type: new GraphQLNonNull(UserInputType) }
                },
            },
            createPost: {
                type: createPostType,
                args: {
                    postInput: { type: new GraphQLNonNull(PostInputType) }
                }
            }
        }
    })
});

module.exports = schema;
