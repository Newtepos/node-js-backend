const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInputObjectType, GraphQLID, GraphQLList } = require('graphql');


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

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        _id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        imageUrl: { type: GraphQLString },
        creater: { type: UserType },
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
            }
        }
    })
});

module.exports = schema;
