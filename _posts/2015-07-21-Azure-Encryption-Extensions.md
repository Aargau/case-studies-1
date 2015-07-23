---
layout: post
title:  "Storing Data Securely in Azure Blob Storage with Azure Encryption Extensions"
author: "Stefan Gordon"
author-link: "http://www.stefangordon.com/"
#author-image: "{{ site.baseurl }}/images/TDB/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Azure, encryption
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Storing Data Securely in Azure Blob Storage with Azure Encryption Extensions.
---

When building applications which require data encrypted at rest and on-the-wire there may be significant complexity added to the software development process.  Organizations building these types of applications must not only invest in the additional resources to write the code, but they must also ensure the implementation is actually secure.

In this document you will learn how you can leverage the [Azure Encryption Extensions library](https://github.com/stefangordon/azure-encryption-extensions) to easily encrypt data you store in Azure Blob Storage using Microsoft’s proven [Cryptographic Service Providers](https://msdn.microsoft.com/en-us/library/windows/desktop/aa380245%28v=vs.85%29.aspx).  This solution also allows you to upgrade existing Azure Blob Storage code with minimal changes.

## The Solution

Azure Encryption Extensions is a simple library designed to streamline the work required to encrypt data stored in Azure Blob Storage. Data is encrypted on-the-fly as it is uploaded to Azure, and decrypted as it is downloaded. Unencrypted data **never leaves your machine** and you can **manage your keys however you'd like.**

![Figure 1]({{site.baseurl}}/images/2015-07-21-Azure-Encryption-Extensions_images/image001.jpg)
 The library provides a set of wrappers over the public Azure Storage SDK which closely mirror the existing storage methods.  This allows developers to access blob storage in a standard way, and reference existing documentation, while still achieving industry-standard security.

## Choosing the Encryption Method

Two core types of encryption are supported.  Symmetric and Asymmetric.  Here we will provide a high level description of how they work, but for more details on the implementation see the links at the bottom of this document.

The **asymmetric mode** provides encryption when you prefer to use a Public-Private Key pair, such as an X509 certificate. This provider allows you to encrypt data with the public key, and decrypt data with the private key. It is useful in scenarios where you want to let systems encrypt data but not give them access to decrypt it. **You can share the public (encryption) key broadly while maintaining the security of your data by protecting the private (decryption) key.**

Asymmetric encryption is valued for the flexibility in managing encryption and decryption keys separately, however it can be very slow for larger datasets.

Azure Encryption Extensions solves this by implementing an industry standard pattern of first encrypting your data with a random symmetric key (very fast) and only using asymmetric encryption to protect the random key.  This random key is then encrypted asymmetrically using your key-pair. The encrypted random key is prepended to the encrypted stream so that it can be recovered as part of the decryption process. This whole process happens on-the-fly during reads and writes with no buffering or disk access required.

The **symmetric mode** is designed for scenarios where you prefer to use the same key for encryption and decryption. This is often more simple to manage, and performs better than the asymmetric option. The provider performs industry standard AES encryption.  

## Storing your keys

Azure Encryption Extensions is intentionally non-opinionated about key storage and permits a wide variety of options for key generation and use.

For all encryption types default constructors will generate cryptographically random and secure keys, which you can then export easily as a JSON string, or write to a file, and store as appropriate.

Alternatively you can provide your own keys in a variety of formats, including X509 Certificates, binary arrays, or JSON strings.

It is essential that you have an appropriate key management solution for your application, and this should be one of your first design decisions.  Some scenarios may benefit from working [with Azure Key Vault](http://azure.microsoft.com/en-us/services/key-vault/) while others may have custom key management strategies.

## Using the Library

Here we present a simple example of encrypting and uploading a file to Azure Blob Storage, and then downloading and decrypting it.  In this example a typical X509 certificate is used for asymmetric encryption.

```
CloudBlockBlob blob = container.GetBlockBlobReference("TestBlob");

// Create an Asymmetric provider from an X509Certificate2
var provider = new AsymmetricBlobCryptoProvider(certificate);

// Encrypt and upload the file to Azure, passing in our provider
blob.UploadFromFileEncrypted(provider, path, FileMode.Open);

// Download and decrypt the file
blob.DownloadToFileEncrypted(provider, destinationPath, FileMode.Create);
```

Note that the Upload and Download methods have signatures which are very similar to those from the underlying Azure Storage SDK.  Simply append the word “Encrypted” to the end of the methods to leverage the encrypted version and include one additional parameter to reference the encryption provider.  Defaults for all optional parameters will match the original methods.

## Code Artifacts

Azure Encryption Extensions is available as a library released under a MIT license.  It is fully open source on GitHub and compatible with .Net 3.5 or later.

You can install the library via [NuGet](https://www.nuget.org/packages/AzureEncryptionExtensions):

```PM> Install-Package AzureEncryptionExtensions```

Or get the latest version by syncing the repository directly:

# [https://github.com/stefangordon/azure-encryption-extensions](https://github.com/stefangordon/azure-encryption-extensions)

Extension documentation on the encryption implementation and library usage is available in the [readme](https://github.com/stefangordon/azure-encryption-extensions).

# Summary

Azure Encryption Extensions is an easy way for teams to add encryption to their application while leveraging Azure Blob Storage.  It helps ensure you implement your security in an industry standard way and permits easy retrofitting of legacy storage applications.  These extensions can be used in client applications ranging from line-of-business desktop solutions to Xamarin based mobile apps.  Additionally, the extensions can be used in server side solutions running in Azure or your own datacenter.
