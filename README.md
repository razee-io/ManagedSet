# ManagedSet

[![Build Status](https://travis-ci.com/razee-io/ManagedSet.svg?branch=master)](https://travis-ci.com/razee-io/ManagedSet)
![GitHub](https://img.shields.io/github/license/razee-io/ManagedSet.svg?color=success)

ManagedSet is a resource used to group and enforce other resources. It is simple
and doesn't anything past enforcing the defined resources.

## Install

```shell
kubectl apply -f "https://github.com/razee-io/ManagedSet/releases/latest/download/resource.yaml"
```

## Resource Definition

### Sample

```yaml
kind: ManagedSet
apiVersion: kapitan.razee.io/v1alpha1
metadata:
  name: <managed_set_name>
  namespace: <namespace>
spec:
  resources:
  - apiVersion: v1
    kind: ConfigMap
    metadata:
      name: nginx-config
    data:
      configData: some-config-data-string
  - apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nginx-deployment
      labels:
        app: nginx
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: nginx
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: nginx:1.7.9
            ports:
            - containerPort: 80
```

### Required Fields

- `.spec.resources`
  - type: array
  - items:
    - type: object
    - required: [kind, apiVersion, metadata]

## Features

### Reconcile

`.spec.resources.metadata.labels[kapitan.razee.io/Reconcile]`

- DEFAULT: `true`
  - A kapitan resource (parent) will clean up a resources it applies (child) when
either the child is no longer in the parent resource definition or the parent is
deleted.
- `false`
  - This behavior can be overridden when a child's resource definition has
the label `kapitan.razee.io/Reconcile=false`.

### Resource Update Mode

`.spec.resources.metadata.labels[kapitan.razee.io/mode]`

Kapitan resources default to merge patching children. This behavior can be
overridden when a child's resource definition has the label
`kapitan.razee.io/mode=<mode>`

Mode options:

- DEFAULT: `MergePatch`
  - A simple merge, that will merge objects and replace arrays. Items previously
  defined, then removed from the definition, will be removed from the live resource.
  - "As defined in [RFC7386](https://tools.ietf.org/html/rfc7386), a Merge Patch
  is essentially a partial representation of the resource. The submitted JSON is
  "merged" with the current resource to create a new one, then the new one is
  saved. For more details on how to use Merge Patch, see the RFC." [Reference](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#patch-operations)
- `StrategicMergePatch`
  - A more complicated merge, the kubernetes apiServer has defined keys to be
  able to intelligently merge arrays it knows about.
  - "Strategic Merge Patch is a custom implementation of Merge Patch. For a
  detailed explanation of how it works and why it needed to be introduced, see
  [StrategicMergePatch](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-api-machinery/strategic-merge-patch.md)."
  [Reference](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#patch-operations)
  - [Kubectl Apply Semantics](https://kubectl.docs.kubernetes.io/pages/app_management/field_merge_semantics.html)
- `EnsureExists`
  - Will ensure the resource is created and is replaced if deleted. Will not
  enforce a definition.
