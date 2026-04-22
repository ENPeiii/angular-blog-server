/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PublicTopicsController } from './controllers/public/topicsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PublicTagsController } from './controllers/public/tagsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PublicPostsController } from './controllers/public/postsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PublicBannerController } from './controllers/public/bannerController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminTopicsController } from './controllers/admin/topicsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminTagsController } from './controllers/admin/tagsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminPostsController } from './controllers/admin/postsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminBannerController } from './controllers/admin/bannerController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "PublicTopic": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PublicTopic-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PublicTopic"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PublicTopic_": {
        "dataType": "refObject",
        "properties": {
            "data": {"ref":"PublicTopic","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PublicTag": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PublicTag-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PublicTag"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PublicTag_": {
        "dataType": "refObject",
        "properties": {
            "data": {"ref":"PublicTag","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.CategoriesType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["tech"]},{"dataType":"enum","enums":["life"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CategoriesType": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.CategoriesType","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostListItem": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "categories": {"ref":"CategoriesType","required":true},
            "topicId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PostListItem-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PostListItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostLatestItem": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "categories": {"ref":"CategoriesType","required":true},
            "content": {"dataType":"string","required":true},
            "tags": {"dataType":"array","array":{"dataType":"refObject","ref":"PublicTag"},"required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PostLatestItem-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PostLatestItem"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PublicPost": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "content": {"dataType":"string","required":true},
            "categories": {"ref":"CategoriesType","required":true},
            "topicId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "topic": {"dataType":"union","subSchemas":[{"ref":"PublicTopic"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "tags": {"dataType":"array","array":{"dataType":"refObject","ref":"PublicTag"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PublicPost_": {
        "dataType": "refObject",
        "properties": {
            "data": {"ref":"PublicPost","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.BannerType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["img"]},{"dataType":"enum","enums":["imgText"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BannerType": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.BannerType","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PublicBanner": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "type": {"ref":"BannerType","required":true},
            "imgUrl": {"dataType":"string","required":true},
            "imgAlt": {"dataType":"string","required":true},
            "content": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PublicBanner-or-undefined_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"union","subSchemas":[{"ref":"PublicBanner"},{"dataType":"undefined"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Topic": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Topic-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Topic"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Topic_": {
        "dataType": "refObject",
        "properties": {
            "data": {"ref":"Topic","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateTopicDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateTopicDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tag": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Tag-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Tag"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Tag_": {
        "dataType": "refObject",
        "properties": {
            "data": {"ref":"Tag","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateTagDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateTagDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostModel": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "content": {"dataType":"string","required":true},
            "categories": {"ref":"CategoriesType","required":true},
            "topicId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "topic": {"dataType":"union","subSchemas":[{"ref":"PublicTopic"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "tags": {"dataType":"array","array":{"dataType":"refObject","ref":"PublicTag"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PostModel-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PostModel"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PostModel_": {
        "dataType": "refObject",
        "properties": {
            "data": {"ref":"PostModel","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePostDto": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
            "content": {"dataType":"string","required":true},
            "categories": {"ref":"CategoriesType","required":true},
            "topicId": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePostDto": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "content": {"dataType":"string"},
            "categories": {"ref":"CategoriesType"},
            "topicId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BannerModel": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "type": {"ref":"BannerType","required":true},
            "imgUrl": {"dataType":"string","required":true},
            "imgAlt": {"dataType":"string","required":true},
            "isActive": {"dataType":"boolean","required":true},
            "content": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BannerModel-Array_": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"BannerModel"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BannerModel_": {
        "dataType": "refObject",
        "properties": {
            "data": {"ref":"BannerModel","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateBannerDto": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
            "type": {"ref":"BannerType","required":true},
            "imgUrl": {"dataType":"string","required":true},
            "imgAlt": {"dataType":"string","required":true},
            "content": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateBannerDto": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "imgUrl": {"dataType":"string"},
            "imgAlt": {"dataType":"string"},
            "content": {"dataType":"string"},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsPublicTopicsController_getTopics: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/public/topics',
            ...(fetchMiddlewares<RequestHandler>(PublicTopicsController)),
            ...(fetchMiddlewares<RequestHandler>(PublicTopicsController.prototype.getTopics)),

            async function PublicTopicsController_getTopics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicTopicsController_getTopics, request, response });

                const controller = new PublicTopicsController();

              await templateService.apiHandler({
                methodName: 'getTopics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPublicTopicsController_getTopic: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/public/topics/:id',
            ...(fetchMiddlewares<RequestHandler>(PublicTopicsController)),
            ...(fetchMiddlewares<RequestHandler>(PublicTopicsController.prototype.getTopic)),

            async function PublicTopicsController_getTopic(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicTopicsController_getTopic, request, response });

                const controller = new PublicTopicsController();

              await templateService.apiHandler({
                methodName: 'getTopic',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPublicTagsController_getTags: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/public/tags',
            ...(fetchMiddlewares<RequestHandler>(PublicTagsController)),
            ...(fetchMiddlewares<RequestHandler>(PublicTagsController.prototype.getTags)),

            async function PublicTagsController_getTags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicTagsController_getTags, request, response });

                const controller = new PublicTagsController();

              await templateService.apiHandler({
                methodName: 'getTags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPublicTagsController_getTag: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/public/tags/:id',
            ...(fetchMiddlewares<RequestHandler>(PublicTagsController)),
            ...(fetchMiddlewares<RequestHandler>(PublicTagsController.prototype.getTag)),

            async function PublicTagsController_getTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicTagsController_getTag, request, response });

                const controller = new PublicTagsController();

              await templateService.apiHandler({
                methodName: 'getTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPublicPostsController_getPosts: Record<string, TsoaRoute.ParameterSchema> = {
                categories: {"in":"query","name":"categories","dataType":"string"},
                topicId: {"in":"query","name":"topicId","dataType":"string"},
        };
        app.get('/public/posts',
            ...(fetchMiddlewares<RequestHandler>(PublicPostsController)),
            ...(fetchMiddlewares<RequestHandler>(PublicPostsController.prototype.getPosts)),

            async function PublicPostsController_getPosts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicPostsController_getPosts, request, response });

                const controller = new PublicPostsController();

              await templateService.apiHandler({
                methodName: 'getPosts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPublicPostsController_getLatestPosts: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/public/posts/latest',
            ...(fetchMiddlewares<RequestHandler>(PublicPostsController)),
            ...(fetchMiddlewares<RequestHandler>(PublicPostsController.prototype.getLatestPosts)),

            async function PublicPostsController_getLatestPosts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicPostsController_getLatestPosts, request, response });

                const controller = new PublicPostsController();

              await templateService.apiHandler({
                methodName: 'getLatestPosts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPublicPostsController_getPost: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/public/posts/:id',
            ...(fetchMiddlewares<RequestHandler>(PublicPostsController)),
            ...(fetchMiddlewares<RequestHandler>(PublicPostsController.prototype.getPost)),

            async function PublicPostsController_getPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicPostsController_getPost, request, response });

                const controller = new PublicPostsController();

              await templateService.apiHandler({
                methodName: 'getPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPublicBannerController_getPublicBanner: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/public/banner',
            ...(fetchMiddlewares<RequestHandler>(PublicBannerController)),
            ...(fetchMiddlewares<RequestHandler>(PublicBannerController.prototype.getPublicBanner)),

            async function PublicBannerController_getPublicBanner(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPublicBannerController_getPublicBanner, request, response });

                const controller = new PublicBannerController();

              await templateService.apiHandler({
                methodName: 'getPublicBanner',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTopicsController_getTopics: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/admin/topics',
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController.prototype.getTopics)),

            async function AdminTopicsController_getTopics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTopicsController_getTopics, request, response });

                const controller = new AdminTopicsController();

              await templateService.apiHandler({
                methodName: 'getTopics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTopicsController_getTopic: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/admin/topics/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController.prototype.getTopic)),

            async function AdminTopicsController_getTopic(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTopicsController_getTopic, request, response });

                const controller = new AdminTopicsController();

              await templateService.apiHandler({
                methodName: 'getTopic',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTopicsController_createTopic: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateTopicDto"},
        };
        app.post('/admin/topics',
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController.prototype.createTopic)),

            async function AdminTopicsController_createTopic(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTopicsController_createTopic, request, response });

                const controller = new AdminTopicsController();

              await templateService.apiHandler({
                methodName: 'createTopic',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTopicsController_updateTopic: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateTopicDto"},
        };
        app.put('/admin/topics/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController.prototype.updateTopic)),

            async function AdminTopicsController_updateTopic(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTopicsController_updateTopic, request, response });

                const controller = new AdminTopicsController();

              await templateService.apiHandler({
                methodName: 'updateTopic',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTopicsController_deleteTopic: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/admin/topics/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTopicsController.prototype.deleteTopic)),

            async function AdminTopicsController_deleteTopic(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTopicsController_deleteTopic, request, response });

                const controller = new AdminTopicsController();

              await templateService.apiHandler({
                methodName: 'deleteTopic',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTagsController_getTags: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/admin/tags',
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController.prototype.getTags)),

            async function AdminTagsController_getTags(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTagsController_getTags, request, response });

                const controller = new AdminTagsController();

              await templateService.apiHandler({
                methodName: 'getTags',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTagsController_getTag: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/admin/tags/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController.prototype.getTag)),

            async function AdminTagsController_getTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTagsController_getTag, request, response });

                const controller = new AdminTagsController();

              await templateService.apiHandler({
                methodName: 'getTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTagsController_createTag: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateTagDto"},
        };
        app.post('/admin/tags',
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController.prototype.createTag)),

            async function AdminTagsController_createTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTagsController_createTag, request, response });

                const controller = new AdminTagsController();

              await templateService.apiHandler({
                methodName: 'createTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTagsController_updateTag: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateTagDto"},
        };
        app.put('/admin/tags/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController.prototype.updateTag)),

            async function AdminTagsController_updateTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTagsController_updateTag, request, response });

                const controller = new AdminTagsController();

              await templateService.apiHandler({
                methodName: 'updateTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminTagsController_deleteTag: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/admin/tags/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminTagsController.prototype.deleteTag)),

            async function AdminTagsController_deleteTag(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminTagsController_deleteTag, request, response });

                const controller = new AdminTagsController();

              await templateService.apiHandler({
                methodName: 'deleteTag',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminPostsController_getPosts: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/admin/posts',
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController.prototype.getPosts)),

            async function AdminPostsController_getPosts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminPostsController_getPosts, request, response });

                const controller = new AdminPostsController();

              await templateService.apiHandler({
                methodName: 'getPosts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminPostsController_getPost: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/admin/posts/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController.prototype.getPost)),

            async function AdminPostsController_getPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminPostsController_getPost, request, response });

                const controller = new AdminPostsController();

              await templateService.apiHandler({
                methodName: 'getPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminPostsController_createPost: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreatePostDto"},
        };
        app.post('/admin/posts',
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController.prototype.createPost)),

            async function AdminPostsController_createPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminPostsController_createPost, request, response });

                const controller = new AdminPostsController();

              await templateService.apiHandler({
                methodName: 'createPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminPostsController_updatePost: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdatePostDto"},
        };
        app.put('/admin/posts/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController.prototype.updatePost)),

            async function AdminPostsController_updatePost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminPostsController_updatePost, request, response });

                const controller = new AdminPostsController();

              await templateService.apiHandler({
                methodName: 'updatePost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminPostsController_deletePost: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/admin/posts/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController)),
            ...(fetchMiddlewares<RequestHandler>(AdminPostsController.prototype.deletePost)),

            async function AdminPostsController_deletePost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminPostsController_deletePost, request, response });

                const controller = new AdminPostsController();

              await templateService.apiHandler({
                methodName: 'deletePost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminBannerController_getBanners: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/admin/banner',
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController)),
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController.prototype.getBanners)),

            async function AdminBannerController_getBanners(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminBannerController_getBanners, request, response });

                const controller = new AdminBannerController();

              await templateService.apiHandler({
                methodName: 'getBanners',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminBannerController_getBanner: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/admin/banner/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController)),
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController.prototype.getBanner)),

            async function AdminBannerController_getBanner(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminBannerController_getBanner, request, response });

                const controller = new AdminBannerController();

              await templateService.apiHandler({
                methodName: 'getBanner',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminBannerController_createBanner: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateBannerDto"},
        };
        app.post('/admin/banner',
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController)),
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController.prototype.createBanner)),

            async function AdminBannerController_createBanner(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminBannerController_createBanner, request, response });

                const controller = new AdminBannerController();

              await templateService.apiHandler({
                methodName: 'createBanner',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminBannerController_updateBanner: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateBannerDto"},
        };
        app.put('/admin/banner/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController)),
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController.prototype.updateBanner)),

            async function AdminBannerController_updateBanner(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminBannerController_updateBanner, request, response });

                const controller = new AdminBannerController();

              await templateService.apiHandler({
                methodName: 'updateBanner',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminBannerController_deleteBanner: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/admin/banner/:id',
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController)),
            ...(fetchMiddlewares<RequestHandler>(AdminBannerController.prototype.deleteBanner)),

            async function AdminBannerController_deleteBanner(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminBannerController_deleteBanner, request, response });

                const controller = new AdminBannerController();

              await templateService.apiHandler({
                methodName: 'deleteBanner',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
