import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("tutorial_01_rg");

// Create an Azure resource (Storage Account)
const storageAccount = new storage.StorageAccount("tutorial01sa", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
    kind: storage.Kind.StorageV2,
});

//enable static website support
const staticWebsite = new storage.StorageAccountStaticWebsite("staticWebsite", {
    accountName: storageAccount.name, 
    resourceGroupName: resourceGroup.name, 
    indexDocument: "index.html"})

//upload the file 
const indexHtml = new storage.Blob("index.html", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: staticWebsite.containerName,
    source: new pulumi.asset.FileAsset("index.html"),
    contentType: "text/html",
});

const storageAccountKeys = storage.listStorageAccountKeysOutput({
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name
});

// Export the primary key of the Storage Account
export const primaryStorageKey = pulumi.secret(storageAccountKeys.keys[0].value);

// Export endpoint to the website 
export const staticEndpoint = storageAccount.primaryEndpoints.web;